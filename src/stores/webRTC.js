import { defineStore } from 'pinia'
import router from '../router'

import db from '../firebase/init.js'

import {
        collection,
        doc,
        addDoc,
        setDoc,
        onSnapshot,
        getDocs,
        getDoc,
        deleteDoc,
        updateDoc,
        query,
} from "firebase/firestore";

const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRtcStore = defineStore('WebRtcStore', {
  state: () => {
    return {
      peerConnection: null,
      localStream: null,
      remoteStream: null,
      roomDialog: null,
      roomId: null,
      host: null,
      guest: null,
      isScreenSharing: false,
      isMicMuted: false,
      isVideoOff: false,
      isGuestActive: false,
      callTimer: null,
      roomInfo: null,
    }
  },

  getters: {
    callStarted: (state) => {
      return state.roomInfo?.offer?.createdAt;
    },

    hostName: (state) => {
      return state.roomInfo?.offer?.by;
    },

    guestName: (state) => {
      return state.roomInfo?.answer?.by;
    }
  },

  actions: {
    async handleRoomConnection(roomId) {
      const roomRef = doc(collection(db, "rooms"), roomId);
      const roomSnapshot = await getDoc(roomRef);

      if (roomSnapshot.exists()) {
        console.log("room found!");
        this.joinRoomById(roomId);
      } else {
        console.log("No such room!");
        this.createRoom(roomId);
      }
    },

    async createRoom(id) {
      const roomRef = doc(collection(db, "rooms"), id);

      console.log("Create PeerConnection with configuration: ", configuration);
      this.peerConnection = new RTCPeerConnection(configuration);

      this.registerPeerConnectionListeners();

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Code for collecting ICE candidates below
      const callerCandidatesCollection = collection(roomRef, "callerCandidates");

      this.peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
          console.log("Got final candidate!");
          return;
        }
        console.log("Got candidate: ", event.candidate);
        addDoc(callerCandidatesCollection, event.candidate.toJSON());
      });
      // Code for collecting ICE candidates above

      // Code for creating a room below
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log("Created offer:", offer);

      const roomWithOffer = {
        offer: {
          by: localStorage.getItem('localName') || 'Host',
          type: offer.type,
          sdp: offer.sdp,
          createdAt: Date.now(),
        },
      };
      await setDoc(roomRef, roomWithOffer);
      this.roomId = roomRef.id;
      console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
      document.querySelector("#currentRoom").innerText = `Host`;
      // Code for creating a room above

      this.peerConnection.addEventListener("track", (event) => {
        console.log("Got remote track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
          console.log("Add a track to the remoteStream:", track);
          this.remoteStream.addTrack(track);
        });
      });

      // Listening for remote session description below
      onSnapshot(roomRef, async (snapshot) => {
        const data = snapshot.data();
        this.roomInfo = data;
        if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
          console.log("Got remote description: ", data.answer);
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(rtcSessionDescription);
        }
      });
      // Listening for remote session description above

      // Listen for remote ICE candidates below
      const calleeCandidatesQuery = query(collection(roomRef, "calleeCandidates"));
      onSnapshot(calleeCandidatesQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
            this.isGuestActive = true;
            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(data)
            );
          }

          /* if (change.type === "removed") {
            console.log("Remote ICE candidate removed:", change.doc.data());
            this.isGuestActive = false;
          } */
        });
      });
      // Listen for remote ICE candidates above
    },


    async joinRoomById(roomId) {
      this.isGuestActive = true;
      const roomRef = doc(collection(db, "rooms"), roomId);
      const roomSnapshot = await getDoc(roomRef);
      console.log("Got room:", roomSnapshot.exists());
      document.querySelector('#currentRoom').innerText = `Guest`;
      if (roomSnapshot.exists()) {
        onSnapshot(roomRef, async (snapshot) => {
          this.roomInfo = snapshot.data();
        });
        console.log("Create PeerConnection with configuration: ", configuration);
        this.peerConnection = new RTCPeerConnection(configuration);
        this.registerPeerConnectionListeners();
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = collection(
          roomRef,
          "calleeCandidates"
        );
        this.peerConnection.addEventListener("icecandidate", (event) => {
          if (!event.candidate) {
            console.log("Got final candidate!");
            return;
          }
          console.log("Got candidate: ", event.candidate);
          addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        this.peerConnection.addEventListener("track", (event) => {
          console.log("Got remote track:", event.streams[0]);
          event.streams[0].getTracks().forEach((track) => {
            console.log("Add a track to the remoteStream:", track);
            this.remoteStream.addTrack(track);
          });
        });

        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer;
        console.log("Got offer:", offer);
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await this.peerConnection.createAnswer();
        console.log("Created answer:", answer);
        await this.peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
          answer: {
            by: localStorage.getItem('localName') || 'Guest',
            type: answer.type,
            sdp: answer.sdp,
          },
        };
        await updateDoc(roomRef, roomWithAnswer);
        // Code for creating SDP answer above


        // Listening for remote ICE candidates below
        const callerCandidatesQuery = query(
          collection(roomRef, "callerCandidates")
        );
        onSnapshot(callerCandidatesQuery, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              let data = change.doc.data();
              console.log(
                `Got new remote ICE candidate: ${JSON.stringify(data)}`
              );
              await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(data)
              );
            }
          });
        });
        // Listening for remote ICE candidates above
      }
    },

    async openUserMedia(e) {
      const stream = await navigator.mediaDevices.getUserMedia(
          {video: true, audio: true});
      document.querySelector('#localVideo').srcObject = stream;
      this.localStream = stream;
      this.remoteStream = new MediaStream();
      document.querySelector('#remoteVideo').srcObject = this.remoteStream;
      console.log('Stream:', document.querySelector('#localVideo').srcObject);
    },

    async hangUp(roomId) {
      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach((track) => track.stop());
      }

      if (this.peerConnection) {
        this.peerConnection.close();
      }

      // Delete room on hangup
      if (roomId) {
        const roomRef = doc(collection(db, "rooms"), roomId);
        const calleeCandidatesQuery = query(
          collection(roomRef, "calleeCandidates")
        );
        const calleeCandidatesSnapshot = await getDocs(calleeCandidatesQuery);
        calleeCandidatesSnapshot.forEach(async (candidate) => {
          await deleteDoc(candidate.ref);
        });
        const callerCandidatesQuery = query(
          collection(roomRef, "callerCandidates")
        );
        const callerCandidatesSnapshot = await getDocs(callerCandidatesQuery);
        callerCandidatesSnapshot.forEach(async (candidate) => {
          await deleteDoc(candidate.ref);
        });
        await deleteDoc(roomRef);

        router.push({name: 'lobby'});
      }

    },

    registerPeerConnectionListeners() {
      this.peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);

      });

      this.peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${this.peerConnection.connectionState}`);

      });

      this.peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${this.peerConnection.signalingState}`);

      });

      this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(`ICE connection state change: ${this.peerConnection.iceConnectionState}`);

      });
    },

    shareScreen() {
      navigator.mediaDevices.getDisplayMedia({video: true})
        .then(stream => {
          const videoTrack = stream.getVideoTracks()[0];
          videoTrack.onended = () => {
            this.stopScreenShare();
          };
          const sender = this.peerConnection.getSenders().find(s => s.track.kind === videoTrack.kind);
          sender.replaceTrack(videoTrack);
          this.isScreenSharing = true;

          videoTrack.addEventListener('ended', () => {
            this.stopScreenShare();
          });
        })
        .catch(err => {
          console.log('Unable to get display media ' + err);
        });
    },

    stopScreenShare() {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
      this.isScreenSharing = false;

    },

    muteMic() {
      this.localStream.getAudioTracks()[0].enabled = false;
      this.isMicMuted = true;
    },

    unMuteMic() {
      this.localStream.getAudioTracks()[0].enabled = true;
      this.isMicMuted = false;
    },

    videoOff() {
      this.localStream.getVideoTracks()[0].enabled = false;
      this.isVideoOff = true;
    },

    videoOn() {
      this.localStream.getVideoTracks()[0].enabled = true;
      this.isVideoOff = false;
    }
  }
})
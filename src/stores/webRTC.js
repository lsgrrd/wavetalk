import { defineStore } from 'pinia'
import { initializeApp } from 'firebase/app';
import {  getFirestore,
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

const firebaseConfig = {
  apiKey: "AIzaSyA64A5h0yyysHAXcgAXleW0dmVr27HOCqo",
  authDomain: "monoestereotv.firebaseapp.com",
  projectId: "monoestereotv",
  storageBucket: "monoestereotv.appspot.com",
  messagingSenderId: "574702885108",
  appId: "1:574702885108:web:2c2bfa659cd064000f26a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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
    }
  },

  getters: {

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
          type: offer.type,
          sdp: offer.sdp,
        },
      };
      await setDoc(roomRef, roomWithOffer);
      this.roomId = roomRef.id;
      console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
      document.querySelector("#currentRoom").innerText = `Current room is ${roomRef.id} - You are the caller!`;
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
            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(data)
            );
          }
        });
      });
      // Listen for remote ICE candidates above
    },

    joinRoom() {
      document.querySelector('#confirmJoinBtn').
          addEventListener('click', async () => {
            this.roomId = document.querySelector('#room-id').value;
            console.log('Join room: ', this.roomId);
            document.querySelector(
                '#currentRoom').innerText = `Current room is ${this.roomId} - You are the callee!`;
            await this.joinRoomById(this.roomId);
          }, {once: true});

    },

    async joinRoomById(roomId) {
      const roomRef = doc(collection(db, "rooms"), roomId);
      const roomSnapshot = await getDoc(roomRef);
      console.log("Got room:", roomSnapshot.exists());

      if (roomSnapshot.exists()) {
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
      }

    },

    registerPeerConnectionListeners() {
      this.peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
      });

      this.peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${this.peerConnection.connectionState}`);
      });

      this.peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
      });

      this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
      });
    },


  }
})
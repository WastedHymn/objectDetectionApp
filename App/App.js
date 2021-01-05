import React, { useState, useEffect, useRef } from "react";
//import { StatusBar } from 'expo-status-bar';
//import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  ImageBackground,
  Alert,
  LogBox
} from "react-native";

import { Camera } from "expo-camera";
import { FontAwesome } from "@expo/vector-icons";
//import { Buffer } from "buffer";
//import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
//import * as firebase from 'firebase';
//import uuid from 'uuid';

LogBox.ignoreAllLogs();

export default function App() {

  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasPermission, setHasPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(false);

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedPhotoName, setCapturedPhotoName] = useState(null);

  const [open, setOpen] = useState(false);
  const [showPickedPhoto, setShowPickedPhoto] = useState(false);

  const [image, setPickedImage] = useState(null);

  const [processedImage, setProccessedImage] = useState(null);
  const [showProcessedImage, setShowProcessedImage] = useState(null);

  const camRef = useRef(null);



  useEffect(() => {
    (async () => {
      //console.log(FirebaseCore.DEFAULT_APP_OPTIONS);
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
      console.log("Camera Request Status:" + status);
      const { gallerystatus } = await MediaLibrary.requestPermissionsAsync();
      console.log(
        "Media Library Request Status:" + (await MediaLibrary.getPermissionsAsync()).granted
      );
      var perm = (await MediaLibrary.getPermissionsAsync()).granted;
      if (perm == true) {
        setGalleryPermission(true);
      } else {
        setGalleryPermission(false);
      }
    })();
  }, []);

  if (hasPermission === null || galleryPermission === null) {
    return <View />;
  }

  if (hasPermission == false || galleryPermission == false) {
    return <Text>İzin Alınamadı!</Text>;
  }

  const pickImage = async () => {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [16, 9],
      quality: 1,
      base64: true,
    });

    console.log(image);

    if (!image.cancelled) {
      console.log("Image Selected!");
      setPickedImage(image);
      console.log(image.uri);
      console.log(image.height);
      console.log(image.width);
      setShowPickedPhoto(true);
      
    }
  };

  async function takePicture() {
    if (camRef) {
      const data = await camRef.current.takePictureAsync();
      const manipResult = await ImageManipulator.manipulateAsync(
        data.uri, [{ rotate: 0 },], { base64: true }, { compress: 1 }, { format: ImageManipulator.SaveFormat.PNG }
      ).then((data) => {
        console.log("Captured Photo: ", data.uri, " ", data.width, " ", data.height);
        console.log(data);
        var tempname = getCurDate();

        setCapturedPhoto(data);
        setCapturedPhotoName(tempname);
        setOpen(true);

      }).catch((error) => { console.log("MANIPULATE ERROR!\n", error) });

    }
  }

  function getCurDate() {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds  
    var imageName = date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec;
    return imageName;
  }

  //Source: https://www.youtube.com/watch?v=KkZckepfm2Q
  const uploadImage = async (uploadImage0, imageName) => {
    //console.log(uploadImage0.base64);
    await fetch('http://34.227.177.184:80/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imgsource: uploadImage0.base64,
        imgname: imageName,
      }),
    }).then(async (resp) => {

      //var json = JSON.parse(resp.body);
      var tep = await resp.json();
      var ivj = tep.imagebase
      
      var date = new Date().getDate(); //Current Date
      var month = new Date().getMonth() + 1; //Current Month
      var year = new Date().getFullYear(); //Current Year
      var hours = new Date().getHours(); //Current Hours
      var min = new Date().getMinutes(); //Current Minutes
      var sec = new Date().getSeconds(); //Current Seconds  
      var imageName = date + '' + month + '' + year + '' + hours + '' + min + '' + sec + ".png";

      const filename = FileSystem.cacheDirectory + imageName;// + getCurDate();
      console.log("processed image filename: " + filename);
      await FileSystem.writeAsStringAsync(filename, tep.imagebase, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mediaResult = await MediaLibrary.createAssetAsync(filename).then(() => {
        console.log("PROCESSED IMAGE SAVED!");
        setProccessedImage(filename);
        setShowProcessedImage(true);
      }).catch((error) => {
        console.log("PROCESSED IMAGE SAVE ERROR: ");
        console.log(error);
      });
      //console.log(mediaResult);
    });


  }

  async function savePicture() {
    console.log("SAVING CAPTURED PHOTO...");


    const asset = await MediaLibrary.createAssetAsync(capturedPhoto.uri)
      .then(() => {
        Alert.alert("CAPTURED PHOTO SAVED!");
        console.log(capturedPhoto.uri);
        console.log("SAVED!");
      })
      .catch((error) => {
        Alert.alert("savePicture Error!\n" + error);
        console.log(capturedPhoto.uri);
        console.log("savePicture ERROR: " + error);
      });


    await uploadImage(capturedPhoto, capturedPhotoName).then(
      (adf) => {
        //console.log("Upload URL: " + capturedPhoto.uri);
        Alert.alert("Image Uploaded!");

      }
    ).catch((error) => {
      Alert.alert("uploadImage error!\n", error);
      console.log(error);
    });

  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.cameraStyle}
        type={type}
        ratio={"16:9"}
        ref={camRef}
        flashMode={true}
        autoFocus={true}
        flashMode={"on"}
      >
        <View style={styles.viewStyle}>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.buttonStyle}
            onPress={takePicture}
          >
            <FontAwesome name="camera" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.buttonStyle2}
            onPress={pickImage}
          >
            <FontAwesome name="image" size={30} color="white" />
          </TouchableOpacity>

          {capturedPhoto && (
            <Modal animationType="slide" transparent={false} visible={open}>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 1,
                  backgroundColor: "rgba(71, 69, 68, 0.2)",
                }}
              >
                <Image
                  style={{ width: "90%", height: "90%" }}
                  resizeMode="contain"
                  source={{ uri: capturedPhoto.uri }}
                />

                <View flexDirection="row">
                  <TouchableOpacity
                    style={{ alignItems: "center", marginRight: "5%" }}
                    onPress={() => setOpen(false)}
                  >
                    <FontAwesome
                      name="window-close"
                      size={50}
                      color="red"
                    ></FontAwesome>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ alignItems: "center", marginLeft: "5%" }}
                    onPress={() => {
                      setOpen(false);
                      savePicture();
                    }}
                  >
                    <FontAwesome
                      name="save"
                      size={50}
                      color="green"
                    ></FontAwesome>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {image && (
            <Modal
              visible={showPickedPhoto}
              animationType="fade"
              transparent={false}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(71, 69, 68, 0.2)",
                }}
              >
                <Image
                  source={{ uri: image.uri }}
                  style={styles.pickedImageStyle}
                  resizeMode="contain"
                />
                <View flexDirection="row">
                <TouchableOpacity
                  style={{ alignItems: "flex-start", margin: "1%" }}
                  onPress={() => {
                    //console.log("3333333333333333333333");
                    setShowPickedPhoto(false);
                  }}
                >
                  <FontAwesome
                    name="window-close"
                    size={50}
                    color="red"
                  ></FontAwesome>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ alignItems: "flex-start", margin: "1%" }}
                  onPress={() => {
                    setShowPickedPhoto(false);
                    console.log(image.base64);
                    uploadImage(image, 'imageName').then(()=>{
                      //console.log("11111111111111111");
                    }).catch((error)=>{
                      console.log(error);
                    });
                  }}
                >
                  <FontAwesome
                    name="upload"
                    size={50}
                    color="green"
                  ></FontAwesome>
                </TouchableOpacity>
                </View>

              </View>
            </Modal>
          )}

          {
            processedImage && (
              <Modal
                visible={showProcessedImage}
                animationType='fade'
                transparent={false}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(71, 69, 68, 0.2)",
                  }}
                >
                  <Image
                    source={{ uri: processedImage }}
                    style={styles.pickedImageStyle}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={{ alignItems: "center", margin: "1%" }}
                    onPress={() => setShowProcessedImage(false)}
                  >
                    <FontAwesome
                      name="window-close"
                      size={50}
                      color="red"
                    ></FontAwesome>
                  </TouchableOpacity>
                </View>
              </Modal>
            )
          }
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  pickedImageStyle: {
    width: "90%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonStyle: {
    position: "absolute",
    //marginTop: 20,
    width: 50,
    height: 50,
    bottom: "5%",
    left: "45%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
    //padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(52, 52, 52, 0.4)",
  },
  buttonStyle2: {
    position: "absolute",
    //marginTop: 20,
    width: 50,
    height: 50,
    bottom: "5%",
    left: "10%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
    //padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(52, 52, 52, 0.4)",
  },
  viewStyle: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  container: {
    flex: 1,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: "center",
  },
  cameraStyle: {
    flex: 1,
  },
});



/*
const firebaseConfig = {
  apiKey: "AIzaSyDfcffPpkq-Yg4sSVjF4vl7ShTgqhodG_4",
  authDomain: "testrecognitionapp-69712.firebaseapp.com",
  projectId: "testrecognitionapp-69712",
  storageBucket: "testrecognitionapp-69712.appspot.com",
  messagingSenderId: "659759233124",
  appId: "1:659759233124:web:93c910229af398f168c771"
};

// https://youtu.be/1hPgQWbWmEk?t=2582 "This 'if' makes sure that we are not running any firebase instance at the moment. "
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
*/
//var date = new Date().getDate(); //Current Date
        //var month = new Date().getMonth() + 1; //Current Month
        //var year = new Date().getFullYear(); //Current Year
        //var hours = new Date().getHours(); //Current Hours
        //var min = new Date().getMinutes(); //Current Minutes
        //var sec = new Date().getSeconds(); //Current Seconds  
        //var imageName = date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec;
/*
  .catch(
    (error) => {
      Alert.alert("uploadImage Error!\n" + error);
      console.log("uploadImage ERROR:\n" + error);
    }
  )
  */
  //const asset = await MediaLibrary.createAssetAsync(data.uri);
        //var save = await MediaLibrary.saveToLibraryAsync(data.uri);
        //console.log(data);
        //console.log(asset);
        //console.log("save: "+ await MediaLibrary.saveToLibraryAsync(asset.uri));

/*
 .finally((response)=>{
   console.log("printing........");
   console.log(response.text());
   return response;
 });
  */

/*
 const options = { encoding: FileSystem.EncodingType.Base64 };


 const blob = await new Promise((resolve, reject) => {
   const xhr = new XMLHttpRequest();

   xhr.onload = function () {
     resolve(xhr.response);
   };

   xhr.onerror = function (e) {
     console.log(e);
     reject(new TypeError('Network request failed'));
   };

   xhr.responseType = 'blob';
   xhr.open('GET', imageUri, true);
   xhr.send(null);
 });

 var locationRef = firebase.storage().ref().child("images/" + uuid.v4());

 const snapshot = await locationRef.put(blob).catch((error) => {
   console.log("locationRef.put(blob) ERROR: " + error);
 });
 blob.close();

 var adress = await snapshot.ref.getDownloadURL();
 console.log("upload address: " + adress);

 return await snapshot.ref.getDownloadURL();
 */
/*
      uploadImage(image.uri, 'pickedImageName').catch((error)=>{
          console.log(error);
      });
      */
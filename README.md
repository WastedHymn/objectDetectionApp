# objectDetectionApp
## Projenin Amacı 
Mobilden kamerayla çekilen veya galeriden seçilen fotoğrafın içindeki nesneleri işaretleyip, hangi nesne olduğunu belirten ve işlenmiş fotoğrafı tekrar istemciye yollayan bir sistem yapmak.
## Mobil Uygulama Tarafı
Uygulama [Expo](https://expo.io) kullanılarak yazıldı. Uygulamadan kamera kullanarak ya da galeriden bir fotoğraf seçilerek fotoğrafın içindeki nesnelerin tanınması için sunucuya yüklenebilir.
###### Uygulamada Kullanılan Paketler
- expo-camera
- expo-image-manipulator
- expo-image-picker
## Sunucu Tarafı
Sunucu Node.js ile yazıldı ve Amazon AWS'te Ubuntu Server üzerinde çalıştırıldı.
###### Sunucuda Kullanılan Paketler
- tensorflow
- coco-ssd
- express
- canvas
- graceful-fs
- multer
- image-size

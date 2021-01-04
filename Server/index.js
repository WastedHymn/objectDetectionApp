//import * as cocoSsd from "@tensorflow-models/coco-ssd";
const coco = require("@tensorflow-models/coco-ssd");
require('@tensorflow/tfjs-backend-cpu');
const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const canvas = require('canvas');
const gFs = require('graceful-fs');

var sizeOf = require('image-size');

//Init express
const app = express();
const port = 80;

var image;
let model;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '15MB' }));

//Create enpoints/route handlers
app.get(
    '/', (req, res) => {
        res.send('Hello!');
    }
);

/*
            const imgcanvas = Canvas.createCanvas(dimensions.width, dimensions.height);
            const ctx = imgcanvas.getContext('2d');
            console.log("Image loaded!");
            //console.log("!!!!!!!!!!!!!!");
            ctx.drawImage(img, 0,0, dimensions.width, dimensions.height);
            let predictions = model.detect(imgcanvas);
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.font = '30px Impact';
            ctx.strokeStyle = '#2980b9';
            ctx.fillStyle = '#1abc9c';
            predictions.forEach((prediction) => {
                ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
                ctx.fillText(prediction.class, prediction.bbox[0] + 10, prediction.bbox[1] + 30)
            })
            ctx.stroke();
            imgcanvas.toBuffer();
    
            //overwriteimage
            let imgName = (new URL(imgURL)).pathname;
            const out = gFs.createWriteStream(__dirname + '/rendered/' + imgName);
            const stream = imgcanvas.createJPEGStream();
            stream.pipe(out);
            out.on('finish', () =>  resolve(predictions));
            */
/*
async function GetPredictions(source,dimensions,buffer){
    
    return new Promise(async (resolve, project) => {
       

        //var fil = fs.readFile(__dirname + '/out.png');
        
        const img = new Canvas.Image();
        
        img.onload =  async() => {
            console.log("+++++++++++++++++++++++++++++");
            const imgcanvas = Canvas.createCanvas(dimensions.width, dimensions.height);
            const ctx = imgcanvas.getContext('2d');
            console.log("Image loaded!");
            //console.log("!!!!!!!!!!!!!!");
            ctx.drawImage(img, 0,0, dimensions.width, dimensions.height);
            let predictions = model.detect(imgcanvas);
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.font = '30px Impact';
            ctx.strokeStyle = '#2980b9';
            ctx.fillStyle = '#1abc9c';
            predictions.forEach((prediction) => {
                ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
                ctx.fillText(prediction.class, prediction.bbox[0] + 10, prediction.bbox[1] + 30)
            })
            ctx.stroke();
            imgcanvas.toBuffer();
    
            
            //overwriteimage
            let imgName = (new URL(imgURL)).pathname;
            const out = gFs.createWriteStream(__dirname + '/rendered/' + imgName);
            const stream = imgcanvas.createJPEGStream();
            stream.pipe(out);
            out.on('finish', () =>  resolve(predictions));
            
        }
        
        img.onerror = (err) => {
            console.log("Some error occured while parsing image.");
            console.log(err);
        }
        
        var imageurl = path.join(__dirname, "\out.jpeg");
        console.log(__dirname);
        console.log(imageurl);
        img.src = imageurl;
        

        
        //img.source = source;
        //console.log("+++++++++++++++");
        
        img.onload = async() => {
            console.log("!!!!!!!!!!!!!!!!!!");
        }
    });
}
*/

async function GetPredictions(imgURL) {
    return new Promise(async (resolve, reject) => {
        console.log("Parsing Image: "+ imgURL);
        const img = new canvas.Image();
        img.onload = async() => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const imgcanvas = canvas.createCanvas(width, height);
            const ctx = imgcanvas.getContext('2d');
            console.log("Image Loaded");
            ctx.drawImage(img, 0, 0, width, height);
            let predictions = await model.detect(imgcanvas);
            console.log(predictions);
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.font = '50px Impact';
            ctx.strokeStyle = '#2980b9';
            ctx.fillStyle = '#1abc9c';
            predictions.forEach((prediction) => {
                ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
                ctx.fillText(prediction.class, prediction.bbox[0] + 10, prediction.bbox[1] + 60)
            })
            ctx.stroke();
            console.log("maxNumBoxes: " + predictions.length);
            ctx.fillText(predictions.length, width-100, height - 100);
            imgcanvas.toBuffer();
    
            //overwriteimage
            //let imgName = (new URL(imgURL)).pathname;
            let imgName = path.join(__dirname);
            console.log("imgName: ", imgName);
            //const out = gFs.createWriteStream(__dirname + '/rendered/' + imgName);
            const out = gFs.createWriteStream(imgURL);
            const stream = imgcanvas.createJPEGStream();
            var temppp = '';   
            stream.pipe(out);
            stream.on('readable', function(){
                temppp = stream.read().toString('base64');
            });
            /*
            stream.on('end', function(){
                console.log('temp: ', temppp);
            });
            */
            out.on('finish', () =>  {
                console.log(stream);
                //resolve(predictions);
                resolve(temppp);
            });
        }
        img.onerror = (err) => {
            console.log("Some error occured while parsing image.");
            console.log(err);
        }
        img.src = imgURL;   
    });
}

async function deneme(source, dimensions, buffer) {
    
    fs.readFile(__dirname + '/out.png', async function (err, data) {
        if (err) throw err
        var objectphoto = new Canvas.Image();
        
        
        objectphoto.onload = async () => {
            console.log("!!!", objectphoto);
            var canvas = new Canvas.Canvas(dimensions.width, dimensions.height);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(objectphoto,0,0, dimensions.width, dimensions.height);
            let predictions = await model.detect(canvas);
        }
        
        objectphoto.src = source;
    });

    /*
    const img = new canvas.Image();
    img.onload = async() => {
        const imagecanvas = canvas.createCanvas(width, height);
        const ctx = imgcanvas.getContext('2d');
        console.log("Image loaded.");
        ctx.drawImage(img, 0,0, dimensions.width, dimensions.height);
        let predictions = await model.detect(imgcanvas);
        console.log("!!!", predictions);
    }
    */
    //var array = new Uint8ClampedArray(buffer);
    console.log(typeof (buffer));
    console.log(buffer);


}

async function writesomefile(source){
    
    return new Promise( (resolve, reject) =>{
       var temp = path.join(__dirname, '/out.png');
        console.log("1111111111111111111111111");
        gFs.writeFileSync(temp, source, 'base64', (err, data) => {
            if (err) throw err
        });
        
        resolve('test');
    });
}

app.post('/upload', async (req, res, next) => {
    var source = req.body.imgsource;
    //console.log(req.body.imgsource);
    console.log(typeof (req.body.imgsource));
    var encodedImage ='';
    //gFs.writeFile('./out.png', source, 'base64', (err, data) => {
    //    if (err) throw err
    //});
    
    writesomefile(source).finally(async (data) => {
        console.log("22222222222222");
       
        var imageurl = path.join(__dirname,'\out.png');
        //console.log(await GetPredictions(imageurl));
        encodedImage = await GetPredictions(imageurl);
        res.json({"imagebase" : encodedImage});
        console.log(encodedImage);
       
        //res.send(encodedImage);
    
    });
    
    /*
    const buffer = Buffer.from(source, "base64");
    const dimensions = sizeOf(buffer);
    console.log(dimensions.width, dimensions.height);
    */
    /*
    await writesomefile(source).then(()=>{
        var imageurl = path.join(__dirname,'\out.png');
    
        //GetPredictions(imageurl);
    });
    */
   
   
    //deneme(source, dimensions, buffer);
    
    /*        
    
    coco.load()
        .then(model => model.detect(buffer))
        .then(predictions => console.log(predictions)).catch((error)=>console.log(error));  
        res.status(200)
        console.log(req.body.name);
      */
     
    //res.send('an image uploaded.');
});

coco.load().then((loadedModel) => {
    console.log("Coco-ssd loaded successfully");
    model = loadedModel
    app.listen(port, () => console.log(`App listening on port ${port}!`));
})

//app.listen(port, () => console.log(`Server Started on ${port}`));
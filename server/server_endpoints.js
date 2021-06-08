const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const html_dirname = '/home/ec2-user/bixby_serv/html'
const dijkstra = require('./dijkstra')
app.locals.dijkstra = dijkstra

//esto es el grap que deberia estar en la base de datos o en archivos apartes, uno por mapa
const graph = {
  0: {1: 1, 8: 1},
  1: {0: 1, 2: 1},
  2: {1: 1, 6: 1, 7: 1},
  3: {2: 1, 4: 1, 5: 1},
  4: {3: 1},
  5: {3: 1},
  6: {2: 1},
  7: {2: 1},
  8: {1: 1, 9: 1, 10: 1},
  9: {8: 1},
 10: {8: 1},
}

const graph_VADA_map = {
  0: {2: 1},
  1: {2: 1},
  2: {0: 1, 1: 1, 3: 1, 4: 1},
  3: {2: 1},
  4: {2: 1, 5: 1, 9: 1, 10: 1},
  5: {4: 1, 6: 1, 7: 1},
  6: {5: 1, 8: 1, 11: 1},
  7: {5: 1},
  8: {6: 1},
  9: {4: 1},
 10: {4: 1},
 11: {6: 1}
}

//////////////////////////////////////////////////
/////////Basic Configuration /////////////////////
/////////////////////////////////////////////////

var db
app.locals.guide_mode = 'false'
app.locals.final_type = 'null'
app.locals.final_owner = 'null'
app.locals.collection = 'vada_map'
app.locals.language = 'en'
var situation_zone = "2"
const uri = "mongodb+srv://jorge:Scofield_23@bixbymaps-cnylt.mongodb.net/test?retryWrites=true&w=majority";

MongoClient.connect(uri, (err, client) => {
    if (err) return console.log(err)
    db = client.db('BixbyMaps')
    app.listen(3000, () => {
        console.log ('listening on 3000')
    })
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', function (req, res) {
    res.sendFile(html_dirname + '/map_form.html')
})

app.get('/location_transition', function (req, res) {
    console.log('location_transition has been called')
    res.send('{"state":"ongoing", "type":"office", "owner"="Luis Cavazos"}')
})

app.get ('/current_location', (req, res) => {
    // esto es solo por debuggeo por comprobar si funciona lo de dijkstra
    var path = dijkstra.calculate(graph, "0", "7")
    console.log(path)
    res.send('{"zone" : "' + situation_zone + '"}')
})

app.post('/current_location', (req, res) => {
    situation_zone = req.body.zone
    console.log(situation_zone)
    res.sendStatus(200)
    return 
})

app.post('/maps', (req, res) => {
    console.log(req.body)
    var body = '{"zone":"' + req.body.zone + '","type":"' + req.body.type + '","owner":"' + 
            req.body.owner + '","path_1":{"zone":"' + req.body.zone_1 + '","instruction":"' + 
            req.body.path_1 + '"},"path_2":{"zone":"' + req.body.zone_2 + '","instruction":"' + 
            req.body.path_2 + '"},"path_3":{"zone":"' + req.body.zone_3 + '","instruction":"' + 
            req.body.path_3 + '"},"path_4":{"zone":"' + req.body.zone_4 + '","instruction":"' + req.body.path_4 + '"}}'
    db.collection(collection).save(JSON.parse(body), (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/')
    })
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////77
//// REMOTE ENDPOINTS //////////////////////////////////////////////////////////////////////////////////////////////7
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/create_travel_itinerary', (req, res) => {
    console.log('entre and locale: ' + req.body.$vivContext.locale)
    if (req.body.$vivContext.locale == 'ko-KR') {
        app.locals.language = 'ko'
        app.locals.collection = 'vada_map_ko'
    }
    else {
       app.locals.language = 'en'
       app.locals.collection = 'vada_map'
    }

    if (app.locals.language == 'en') {
        if ((req.body.owner == 'null') && (req.body.type == 'office')) {
            var body = '{"correctClocation":"unknown", "nextStep":"no office name", "status":"error", "sameLocation":"unknown"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner == 'null') && (req.body.type == 'lab')) {
            var body = '{"correctClocation":"unknown", "nextStep":"no lab name", "status":"error", "sameLocation":"unknown"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner != 'null') && ((req.body.type != 'lab') && (req.body.type != 'office'))) {
            req.body.owner = 'null' 
        }
    }

    if (app.locals.language == 'ko') {
        if ((req.body.owner == 'null') && (req.body.type == '교수실')) {
            var body = '{"owner":"unknown", "type":"교수실"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner == 'null') && (req.body.type == '연구실')) {
            var body = '{"owner":"unknown", "type":"연구실"}'
            var body = '{"owner":"unknown", "type":"연구실"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner != 'null') && ((req.body.type != '연구실') && (req.body.type != '교수실'))) {
            req.body.owner = 'null' 
        }
    }

    // de momento lo hago suponiendo que cuando el usuario pide guia, no esta ya en el destino
    // miro el numero de zona de destino para guardarmelo como referencia
    console.log(req.body.type + ',' + req.body.owner + ',')
    db.collection(app.locals.collection).find({owner:req.body.owner, type:req.body.type})
    .project({zone:1, type: 1,  owner:1, img_url: 1, photo_url: 1, gif_url: 1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
    .toArray(function(err, docs) {
        console.log(docs[0])
        try {
            app.locals.final_zone = docs[0].zone
        } catch (error) {
            var correct_location = "false"
            var next_step = "unknown destination"
            var state = "error"
            var same_location = "true"
            var body = '{"correctLocation":"' + correct_location + '","nextStep":"' + next_step + '","status":"' +
                      state + '","sameLocation":"' + same_location + '"}'
            res.send(JSON.parse(body))
            return 
         }
        // guardo como variable de la app para ser usado en cualquier route el destino al que quiere llegar el usuario
        app.locals.guide_mode = "true"
        app.locals.final_type = req.body.type
        app.locals.final_owner = req.body.owner
        app.locals.old_zone = situation_zone
        app.locals.final_photo_url = docs[0].photo_url
        app.locals.final_img_url = docs[0].img_url
        //ha pedido guia asi que este donde esta, empieza en el punto correcto
        var correct_location = "true"
        zone_path = dijkstra.calculate(graph_VADA_map,situation_zone, app.locals.final_zone)
        app.locals.next_zone = zone_path[1]
        db.collection(app.locals.collection).find({zone:situation_zone, })
        .project({zone:1, type: 1,  owner:1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
        .toArray(function(err, docs_2) {
            if (situation_zone == app.locals.final_zone) {
                var state = "finished"
            }
            else {
                var state = "ongoing"
            }
            var  same_location = "false"
            for (let j = 1; j < 5; j++){
                    if (docs_2[0]['path_' + j]['zone'] == app.locals.next_zone) {
                        var next_step = docs_2[0]['path_' + j]['instruction']
                        console.log('next step: ' + next_step)
                        break
                    }
                }
            if (state == 'finished') {
                app.locals.guide_mode = 'false'
                if (app.locals.language == 'en') {next_step = "oh! but your finger is already there!"}
                if (app.locals.language == 'ko') {next_step = '오! 손가락이 벌써 거기네요!'}
            }
            var body = '{"correctLocation":"' + correct_location + '","nextStep":"' + next_step + '","status":"' +
                     state + '","sameLocation":"' + same_location + '","destinationImgUrl":"' + app.locals.final_img_url + 
                     '","destinationPhotoUrl":"' + app.locals.final_photo_url + '"}'
            console.log(body)
            res.send(JSON.parse(body))
            return 
        })
     })
})

///////////////////////////////////////////////////////////////////////////////////

app.post('/location', (req, res) => {
    // tan pronto como se entra en algo que no es el guide mode, se desactiva el guide mode y presuponemos que ha salido de la guia  el usuario
    //app.locals.guide_mode = 'false'
    // poner eso mejor solo si le entiende pues el usuario pdoria hablar sin querer mientras usa la guia.
    console.log(req.body)
    console.log('entre and locale: ' + req.body.$vivContext.locale)
    if (req.body.$vivContext.locale == 'ko-KR') {
        console.log('selected korean collection')
        app.locals.language = 'ko'
        app.locals.collection = 'vada_map_ko'
    }
    else {
       console.log('selected english collection')
       app.locals.language = 'en'
       app.locals.collection = 'vada_map'
    }

    if (app.locals.language == 'en') {
        if ((req.body.owner == 'null') && (req.body.type == 'office')) {
            var body = '{"owner":"unknown", "type":"office"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner == 'null') && (req.body.type == 'lab')) {
            var body = '{"owner":"unknown", "type":"lab"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner != 'null') && ((req.body.type != 'lab') && (req.body.type != 'office'))) {
            req.body.owner = 'null' 
        }
    }

    if (app.locals.language == 'ko') {
        if ((req.body.owner == 'null') && (req.body.type == '교수실')) {
            var body = '{"owner":"unknown", "type":"교수실"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner == 'null') && (req.body.type == '연구실')) {
            var body = '{"owner":"unknown", "type":"연구실"}'
            var body = '{"owner":"unknown", "type":"연구실"}'
            res.send(JSON.parse(body))
            return 
        }
        if ((req.body.owner != 'null') && ((req.body.type != '연구실') && (req.body.type != '교수실'))) {
            req.body.owner = 'null' 
        }
    }

    //console.log(req.body)
    var here_bool = 0
    if ((req.body.type == 'this') || (req.body.type == '이거')) {
         app.locals_final_zone = situation_zone
        //type = db.map_elementss.find({"zone" : situation_zone},{"_id":0})
        //owner = db.collection('map_elements').find({zone : situation_zone}).owner
        console.log('selected collection: ' + app.locals.collection)
        db.collection(app.locals.collection).find({zone:situation_zone})
        .project({type:1, owner:1, path:1, photo_url: 1, img_url: 1, gif_url: 1, _id:0})
        .toArray(function(err, docs) {
            app.locals.final_type = docs[0].type
            app.locals.final_owner = docs[0].owner
            type = docs[0].type
            owner = docs[0].owner
            app.locals.guide_mode = 'false'
            path = ""
            img_url = docs[0].img_url
            gif_url = docs[0].gif_url
            photo_url = docs[0].photo_url
            body = '{"type":"' + type + '", "owner":"' + owner + '", "path":"' + path + '","img_url":"' + img_url + '","gif_url":"' + gif_url + '","photo_url":"' + photo_url +'"}'
            console.log(body)
            res.send(JSON.parse(body))
            return 
        })
     }
     else {
        if ((req.body.type == 'here?') || (req.body.type == '여기?')) {
            req.body.type = app.locals.final_type
            req.body.owner = app.locals.final_owner
            here_bool = 1
            if (req.body.type == 'null') {
                if (app.locals.language == 'en') {path = "You need to ask about information related to a location first before being able to ask me that"}
                if (app.locals.language == 'ko') {path = '그거 물어보시기 전에  일단 궁금하신 위치에 대해 물어보셔야합니다'}
            }
        } else {
            path = 'unknown'
        }
        db.collection(app.locals.collection).find({owner:req.body.owner, type:req.body.type})
        .project({zone: 1,type:1, owner:1, photo_url: 1, img_url: 1, gif_url: 1, path_1: 1, path_2: 1, path_3: 1, path_4: 1,  _id:0})
        .toArray(function(err, docs) {
             //console.log(JSON.stringify(docs))
             console.log('searched owner :' + req.body.owner)
             console.log('searched type: ' + req.body.type)
             // handle error
             if (err) {
                body = '{"type": "unknown", "owner":"unknown", "path":"' + path + '"}'
                res.send(JSON.parse(body))
                return 
             }
             try {
             app.locals.final_zone = docs[0].zone
             } catch (err) {
                body = '{"type": "unknown", "owner":"unknown", "path":"' + path + '"}'
                res.send(JSON.parse(body))
                return 
             }
             img_url = docs[0].img_url
             gif_url = docs[0].gif_url
             photo_url = docs[0].photo_url
             app.locals.final_type = docs[0].type
             app.locals.final_owner = docs[0].owner
             console.log('app locas creates')
             app.locals.final_zone = docs[0].zone
             console.log('initial zone: ' + situation_zone + '. final_zone: ' + app.locals.final_zone)
             zone_path = dijkstra.calculate(graph_VADA_map, situation_zone, app.locals.final_zone)
             console.log(zone_path)
             var instructions = []

             db.collection(app.locals.collection).find({zone: { $in: zone_path} })
             .project({zone: 1,type:1, owner:1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
             .toArray(function(err_2, docs_2) {
             for(let i = 0; i < zone_path.length - 1; i++){
                 // not necessary since the query takes them in the same order as zone_path, but just in case.
                 var index = docs_2.findIndex(x => x.zone === zone_path[i]);
                 //instructions.push(docs[zone: zone_path[i]]['path_' + zone_path[i + 1]]
                 for (let j = 1; j < 5; j++){
                     console.log(index)
                     console.log(docs_2[index]['path_' + j]['zone'])
                     if (docs_2[index]['path_' + j]['zone'] == zone_path[i+1]) {
                         instructions.push(docs_2[index]['path_' + j]['instruction'])
                         break
                     }
                 }
             }
             if (app.locals.language == "ko") {
                 var filler_1 = '도착하셨습니다!'
                 var filler_2 = '거기가 아닌데 걱정마세요. 또 설명해줄게요. 일단, '
                 var filler_3 = '제가 친절하게 안내해드릴게요. 일단, '
                 var filler_4 = '. 그 후에, '
                 var filler_5 = '. 목적지는  바로 거기입니다.'
             }
             else if (app.locals.language == "en") {
                 var filler_1 = 'Yes, it is there. Great! you arrived.'
                 var filler_2 = 'No, it is not there. I will give you instructions from where you are now. First, '
                 var filler_3 = 'I will tell you the way. First, '
                 var filler_4 = '. Then, '
                 var filler_5 = '. There it is.'
             }
             var path = ""
             console.log('current_zone: ' + situation_zone + '. final_zone: ' + app.locals.final_zone)
             if ((here_bool == 1) && (situation_zone == app.locals.final_zone)) {
                     path = filler_1
             }
             else {
                 if (here_bool == 1) {
                     path = filler_2
                  }
                 else {
                     path = filler_3
                 }
                 for(let i = 0; i < instructions.length; i++){
                     path = path + instructions[i]
                     if (i != instructions.length - 1) {
                         path = path + filler_4
                     }
                 }
             path = path + filler_5
             }
             if (here_bool != '1') {
             app.locals.guide_mode = 'false'
             }
             if ((situation_zone == app.locals.final_zone) && (here_bool != '1')) {
                if (app.locals.language == 'en') {path = "oh! but you are already there!"}
                if (app.locals.language == 'ko') {path = '오! 벌써 거기에 계시네요! '}
             }
             body = '{"type":"' + req.body.type + '", "owner":"' + req.body.owner + '", "path":"' + path + 
                    '","img_url":"' + img_url + '","gif_url":"' + gif_url + '","photo_url":"' + photo_url + '"}'
             console.log(body)
             res.send(JSON.parse(body))
             return
             })
        })
     }
})

/////////////////////////////////////////////////////////////////////////////////////

app.post('/is_there', (req, res) => {
    // tan pronto como se entra en algo que no es el guide mode, se desactiva el guide mode y presuponemos que ha salido de la guia  el usuario
    //app.locals.guide_mode = 'false'
    console.log(req.body)
    console.log('entre and locale: ' + req.body.$vivContext.locale)
    if (req.body.$vivContext.locale == 'ko-KR') {
        app.locals.language = 'ko'
        app.locals.collection = 'vada_map_ko'
    }
    else {
       app.locals.language = 'en'
       app.locals.collection = 'vada_map'
    }

    //if (app.locals.language == 'en') {
    //    if ((req.body.owner == 'null') && (req.body.type == 'office')) {
    //        var body = '{"owner":"unknown", "type":"office"}'
    //        res.send(JSON.parse(body))
    //    }
    //    if ((req.body.owner == 'null') && (req.body.type == 'lab')) {
    //        var body = '{"owner":"unknown", "type":"lab"}'
    //        res.send(JSON.parse(body))
    //    }
    //    if ((req.body.owner != 'null') && ((req.body.type != 'lab') && (req.body.type != 'office'))) {
    //        req.body.owner = 'null' //FUNCIONA MODIFICAR EL BODY ASI?
    //    }
    //}

    //if (app.locals.language == 'ko') {
    //    if ((req.body.owner == 'null') && (req.body.type == '교수실')) {
    //        var body = '{"owner":"unknown", "type":"교수실"}'
    //        res.send(JSON.parse(body))
    //    }
    //    if ((req.body.owner == 'null') && (req.body.type == '연구실')) {
    //        var body = '{"owner":"unknown", "type":"연구실"}'
    //        res.send(JSON.parse(body))
    //    }
    //    if ((req.body.owner != 'null') && ((req.body.type != '연구실') && (req.body.type != '교수실'))) {
    //        req.body.owner = 'null' //FUNCIONA MODIFICAR EL BODY ASI?
    //    }
    // }

    db.collection(app.locals.collection).find({owner:req.body.owner, type:req.body.type})
    .project({zone: 1,type:1, owner:1, gif_url: 1, photo_url: 1, img_url: 1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
    .toArray(function(err, docs) {
         //console.log(JSON.stringify(docs))
         // handle error
         if (err) {
            body = '{"type": "unknown", "owner":"unknown", "path":"unkown"}'
            res.send(JSON.parse(body))
            return
         }
         try {
         app.locals.final_zone = docs[0].zone
         } catch (err) {
            body = '{"type": "unknown", "owner":"unknown", "path":"unknown"}'
            res.send(JSON.parse(body))
            return
          }
          app.locals.final_type = docs[0].type
          app.locals.final_owner = docs[0].owner
             var photo_url = docs[0].photo_url
             var gif_url = docs[0].gif_url
             console.log('initial zone: ' + situation_zone + '. final_zone: ' + docs[0].zone)
             zone_path = dijkstra.calculate(graph_VADA_map,situation_zone, app.locals.final_zone)
             console.log(zone_path)
             var instructions = []

             db.collection(app.locals.collection).find({zone: { $in: zone_path} })
             .project({zone: 1,type:1, owner:1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
             .toArray(function(err_2, docs_2) {
             for(let i = 0; i < zone_path.length - 1; i++){
                 // not necessary since the query takes them in the same order as zone_path, but just in case.
                 var index = docs_2.findIndex(x => x.zone === zone_path[i]);
                 //instructions.push(docs[zone: zone_path[i]]['path_' + zone_path[i + 1]]
                 for (let j = 1; j < 5; j++){
                     console.log(index)
                     console.log(docs_2[index]['path_' + j]['zone'])
                     if (docs_2[index]['path_' + j]['zone'] == zone_path[i+1]) {
                         instructions.push(docs_2[index]['path_' + j]['instruction'])
                         break
                     }
                 }
             }
             path = 'Yes, there is! I will give you directions. First, '
                 for(let i = 0; i < instructions.length; i++){
                     path = path + instructions[i]
                     if (i != instructions.length - 1) {
                         path = path + '. Then, '
                     }
                  }
             app.locals.guide_mode = 'false'
             path = path + '. There it is.'
             body = '{"type":"' + req.body.type + '", "owner":"' + req.body.owner + '", "path":"' + 
                    path + '","photo_url":"' + photo_url + '","gif_url":"' + gif_url + '"}'
             console.log(body)
             res.send(JSON.parse(body))
             return
             })
         })
})

///////////////////////////////////////////////////////////////////////////////////

app.post('/update_itinerary_endpoint', (req, res) => {
    console.log('entre and locale: ' + req.body.$vivContext.locale)
    if (req.body.$vivContext.locale == 'ko-KR') {
        app.locals.language = 'ko'
        app.locals.collection = 'vada_map_ko'
    }
    else {
       app.locals.language = 'en'
       app.locals.collection = 'vada_map'
    }

    //primero comprobamos que el usuario a llamado al modo guia, sino salimos diciendole que para decir next hay que llamar al modo guia.
    if (app.locals.guide_mode == 'false') {
        var body = '{"correctLocation":"unknown", "nextStep":"no guide mode started", "status":"error", "sameLocation":"unknown"}'
        res.send(JSON.parse(body))
        return
    } else {
    console.log('entre al endpoint')
    if (situation_zone == app.locals.next_zone) {
        var correct_location = "true"
    } else {
        var correct_location = "false"
    }
    if (situation_zone == app.locals.old_zone) {
        var same_location = "true"
    } else {same_location = "false"}
    if (situation_zone == app.locals.final_zone) {
        var state = "finished"
    } else {state = "ongoing"}
    if (state == "ongoing") {
    app.locals.old_zone = situation_zone
    //ha pedido guia asi que este donde este, empieza en el punto correcto
    zone_path = dijkstra.calculate(graph_VADA_map,situation_zone, app.locals.final_zone)
    app.locals.next_zone = zone_path[1]
    db.collection(app.locals.collection).find({zone:situation_zone, }).project({zone:1, type: 1,  owner:1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0}).toArray(function(err, docs_2) {
        for (let j = 1; j < 5; j++){
             console.log(docs_2[0]['path_' + j]['zone'])
             if (docs_2[0]['path_' + j]['zone'] == app.locals.next_zone) {
                var next_step = docs_2[0]['path_' + j]['instruction']
                 break
             }
        }
        var body = '{"correctLocation":"' + correct_location + '","nextStep":"' + next_step + '","status":"' + state + 
                    '","sameLocation":"' + same_location + '","destinationImgUrl":"' + app.locals.final_img_url + 
                    '","destinationPhotoUrl":"' + app.locals.final_photo_url + '"}'
        res.send(JSON.parse(body))
        return
    })
    } else {
    var next_step = "finished"
    app.locals.guide_mode = 'false'
    var body = '{"correctLocation":"' + correct_location + '","nextStep":"' + next_step + '","status":"' + state + 
                '","sameLocation":"' + same_location + '","destinationImgUrl":"' + app.locals.final_img_url + 
                '","destinationPhotoUrl":"' + app.locals.final_photo_url + '"}'
    console.log(body)
    res.send(JSON.parse(body))
    return
    }
   }
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/send_location_phone_endpoint', (req, res) => {
    // tan pronto como se entra en algo que no es el guide mode, se desactiva el guide mode y presuponemos que ha salido de la guia  el usuario
    app.locals.guide_mode = 'false'
    console.log('entre and locale: ' + req.body.$vivContext.locale)
    if (req.body.$vivContext.locale == 'ko-KR') {
        app.locals.language = 'ko'
        app.locals.collection = 'vada_map_ko'
    }
    else {
       app.locals.language = 'en'
       app.locals.collection = 'vada_map'
    }

    path = "unknown"
    //Linea necesario por eso de que no se como borrar en el bixby los datos anteriores y a veces se mezclan....
    //if ((req.body.type == "null") || (req.body.type == "this") || (req.body.type == "here?") || (req.body.type == "unknown") || (req.body.type == "이거") || (req.body.type == "여기?")) {
       console.log(app.locals.final_owner)
       console.log(app.locals.final_type)
       var owner = app.locals.final_owner
       var type = app.locals.final_type
       if ((app.locals.final_owner == "null") && ((app.locals.final_type != 'office') 
       || (app.locals.final_type != 'lab') || (app.locals.final_type != '연구실') || (app.locals.final_type != '교수실'))) {
            if (app.locals.language == 'en') {path = "do not know which directions you want"}
            if (app.locals.language == 'ko') {path = '길을 알아보려면 가시고 싶으신 위치를 알려주세요'}
       }
       if (app.locals.final_type == 'null') {
            if (app.locals.language == 'en') {path = "You need to ask about information related to a location first before being able to ask me that"}
            if (app.locals.language == 'ko') {path = '그거 물어보시기 전에  일단 궁금하신 위치에 대해 물어보셔야합니다'}
       }
    //}
    //else {
    //    console.log('entre')
    //    var owner = req.body.owner
        // Linea necesario por eso de que no se como borrar en el bixby los datos anteriores y a veces se mezclan....
    //    if ((req.body.type != "office") && (req.body.type != "lab") && (req.body.type != "연구실") && (req.body.type != "교수실") ) {
    //        owner = "null"
    //    }
    //    var type = req.body.type
    //}
    db.collection(app.locals.collection).find({owner:owner, type:type})
    .project({zone: 1,type:1, owner:1, photo_url: 1, img_url: 1, gif_url: 1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
    .toArray(function(err, docs) {
             console.log(JSON.stringify(docs))
             // handle error
             if (err) {
                body = '{"type": "unknown", "owner":"unknown", "path":"' + path + '"}'
                res.send(JSON.parse(body))
                return
             }
             try {
             var zone = docs[0].zone
             } catch (err) {
                body = '{"type": "unknown", "owner":"unknown", "path":"' + path + '"}'
                res.send(JSON.parse(body))
                return
             }
             app.locals.final_type = 'null'
             app.locals.final_owner = 'null'
             img_url = docs[0].img_url
             gif_url = docs[0].gif_url
             photo_url = docs[0].photo_url
             // For now, zone 2 is hardcoded but it needs to be fetched from database in the future. 
             zone_path = dijkstra.calculate(graph_VADA_map, "2", zone)
             console.log(zone_path)
             var instructions = []
             var urls = []
             db.collection(app.locals.collection).find({zone: { $in: zone_path} })
             .project({zone: 1,type:1, owner:1, gif_url: 1, img_url: 1, photo_url: 1, path_1: 1, path_2: 1, path_3: 1, path_4: 1, _id:0})
             .toArray(function(err, docs_2) {
             for(let i = 0; i < zone_path.length - 1; i++){
                 console.log(docs_2)
                 // not necessary since the query takes them in the same order as zone_path, but just in case.
                 var index = docs_2.findIndex(x => x.zone === zone_path[i]);
                 var index_next_zone = docs_2.findIndex(x => x.zone === zone_path[i+1]);
                 //instructions.push(docs[zone: zone_path[i]]['path_' + zone_path[i + 1]]
                 for (let j = 1; j < 5; j++){
                     console.log(docs_2[index]['path_' + j]['zone'])
                     if (docs_2[index]['path_' + j]['zone'] == zone_path[i+1]) {
                         instructions.push(docs_2[index]['path_' + j]['instruction_phone'])
                         urls.push(docs_2[index_next_zone]["photo_url"])
                         break
                     }
                 }
             }
             console.log(instructions)
             console.log(urls)
             var data_string = '{"steps":[{"inst":"'
             data_string = data_string + instructions[0] + '","url":"' + urls[0]
             for (let i = 1; i < instructions.length; i++) {
                console.log(i)
                data_string = data_string + '"},{"inst":"' + instructions[i] + '","url":"' + urls[i]
             }
             data_string = data_string + '"}]}'
             data = {message: data_string}
             console.log(data_string)
             url = "http://15.164.79.106:3005/msg"
             request.post({headers: {'content-type' : 'application/json'}, url: url, body: JSON.stringify(data) }
                         , function(error, response, body){  
                 console.log('message received: ' + body)
             })
             path = "instructions sent"
             data = '{"type":"' + type + '", "owner":"' + owner + '", "path":"' + path + '","img_url":"' 
                    + img_url + '","gif_url":"' + gif_url + '","photo_url":"' + photo_url + '"}'
             res.send(JSON.parse(data))
             return
             })
         })
})

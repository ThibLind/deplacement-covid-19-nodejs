//Configuration :
const PDF_BASE_FILE = "./certificate.pdf";
const PDF_OUTPUT_FILE = "./attestation.pdf";

const Blob = require("cross-blob");
var fs = require('fs');
var generatePdf = require('./certificate.js');

function aide(){
  console.log("Liste des arguments possibles (valeurs par defaut entre parentheses) :");
  mots_cle.forEach(function(cle, i){
    valeur = cle["valeur"];
    args = cle["args"];
    var str = "     " + args;
    if(valeur) str = str.concat("  (" + valeur + ")");
    console.log(str);
  });
  process.exit(1);
}

function erreur(liste_erreur){
  console.log("Certains arguments OBLIGATOIRES n'ont pas ete fournis :");
  console.log(liste_erreur);
  console.log("Pour obtenir le manuel : '--aide' ou '--help'");
  process.exit(1);
}

function date_actuelle_formatee(){
 var d = new Date();
 return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
}

function heure_actuelle_formatee(){
 var d = new Date();
 return d.getHours() + "h" + d.getMinutes();
}

var mots_cle = [ 
  {
    args:"--nom=",
    prop:"lastname",
    valeur:null}, 
  {
    args:"--prenom=",
    prop:"firstname",
    valeur:null}, 
  {
    args:"--date-naissance=",
    prop:"birthday",
    valeur:null}, 
  {
    args:"--lieu-naissance=",
    prop:"lieunaissance",
    valeur:null}, 
  {
    args:"--adresse=",
    prop:"address",
    valeur:null}, 
  {
    args:"--cp=",
    prop:"zipcode",
    valeur:null}, 
  {
    args:"--ville=",
    prop:"town",
    valeur:null}, 
  {
    args:"--date=",
    prop:"datesortie",
    valeur:date_actuelle_formatee()},
  {
    args:"--heure=",
    prop:"heuresortie",
    valeur:heure_actuelle_formatee()}, 
  {
    args:"--raison=",
    prop:"reasons",
    valeur:"sport"},
  {
    args:"--date-release=",
    prop:"creationDate",
    valeur:date_actuelle_formatee()},
  {
    args:"--heure-release=",
    prop:"creationHour",
    valeur:heure_actuelle_formatee()}
];

var cmd_args = process.argv.slice(2);

//lecture arguments aide :
cmd_args.forEach(function(cmd_arg, i){
  if(cmd_arg == "--aide" || cmd_arg == "--help") aide();
});

//lecture arguments utiles :
cmd_args.forEach(function(cmd_arg, i){
  mots_cle.forEach(function(cle, i){
    args = cle["args"];
    prop = cle["prop"];
    if(cmd_arg.substring(0, args.length) == args){
      cle["valeur"] = cmd_arg.substring(args.length);
    }
  });
});

//verification que tous les arguments necessaires ont bien ete lus et definition de profile :
var liste_erreur = '';
var profile = [];
mots_cle.forEach(function(cle, i){
  valeur = cle["valeur"];
  prop = cle["prop"];
  args = cle["args"];
  if(!valeur){
    liste_erreur = liste_erreur.concat("     " + args + "\n");
  }else{
	profile[prop] = valeur;
  }
});
if(liste_erreur != '') erreur(liste_erreur);

//le travail en lui-meme :
generatePdf(profile, PDF_BASE_FILE).then(
  blob => {
    blob.arrayBuffer().then(
      array_buffer => { 
        buffer = Buffer.from(array_buffer);
        fs.open(PDF_OUTPUT_FILE, 'w', (err, fd) => {
          if(err != null){
            console.log(err);
          }else{
            fs.write(fd, buffer, function(err){
              if(err != null){
                console.log(err);
              }else{
                console.log("Le fichier '" + PDF_OUTPUT_FILE + "' a ete genere avec succes !");
              }
            });
          }
        })
      }
    )
  }
)

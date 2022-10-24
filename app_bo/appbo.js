const express = require('express'); /* le mot clé 'require' indique à Node.js de récupérer le paquet 'express' dans le dossier 'node_modules' */
const app = express(); /* On créé une instance de l'application 'express' grace à la methode express() --> il s'agit du petit server web sur lequel va tourner l'API Rest*/
const cors = require('cors'); // Permettre la communication entre front et backend
const dotenv = require('dotenv'); // Enregistrer les idendifiants et mdp d'accès à mysql + numéro de port de connexion

//config db_service
const { response } = require('express');
const mysqlx = require('@mysql/xdevapi');
const { Session } = require('inspector');
const { createConnection } = require('net');
let instance = null;

dotenv.config(); //

// Intégration du service de connexion à la base de données
const dbService = require('./db_service');
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const { parse } = require('path');

app.use(cors()); //permettra de ne pas bloquer les requetes du client à l'API Rest et bien transmettre les données au server
app.use(express.json()); //for json request
app.use(bodyParser.json());
app.use(express.urlencoded({extended : false}))

// Création de la classe Employe
class ClassEmploye {
    // Définition des propiétés (couple: attribut + valeur) de  la classe
    constructor(Matricule, Nom, Prenom, DateNaissance, DateAmbauche, SalaireAnnuel) {
        this.Matricule = Matricule;
        this.Nom = Nom;
        this.Prenom = Prenom;
        this.DateNaissance = DateNaissance;
        this.DateAmbauche = DateAmbauche;
        this.SalaireAnnuel = SalaireAnnuel;

    }

    // Définition des méthodes de la classe

    calculAge() {
        let date = new Date();
        let dateNai = new Date(this.DateNaissance);
        let Age = date.getFullYear() -  dateNai.getFullYear(); 

        return Age;
    }

    calculAnciennete() {
        let date = new Date();
        let dateAmb = new Date(this.DateAmbauche);
        let Anciennete = date.getFullYear() -  dateAmb.getFullYear(); 

        return Anciennete;
    }

   calculAugmentation() {
        if(this.calculAnciennete() < 5) {
            let augmentation = 0.02 * this.SalaireAnnuel;
            return augmentation;
        } else if(this.calculAnciennete < 10) {
            let augmentation = 0.05 * this.SalaireAnnuel;
            return augmentation; 
        } else {
            let augmentation = 0.1 * this.SalaireAnnuel;
            return augmentation; 
        } 
    } 

}


// Enregistrement d'un nouvel employe en base

app.post('/getAll', (req, res) => {

    // Récupération des données de l'employe du formulaire
    var newMatricule = req.body.matricule;
    var newNom = req.body.nom;
    var newPrenom = req.body.prenom;
    var newDateNaissance = req.body.dateNaissance;
    var newDateAmbauche = req.body.dateAmbauche;
    var newSalaireAnnuel = req.body.salaireAnnuel;

    // Création d'un objet myEmploye dont les attributs proviennent du formulaire
    let myEmploye = new ClassEmploye(newMatricule, newNom, newPrenom, newDateNaissance, newDateAmbauche, newSalaireAnnuel);
    
//Connection à la base de données
mysqlx
.getSession({
    host: process.env.HOST,
    user: 'theboss',
    password: process.env.PASSWORD,
    port: 33060

})
.then(function(session) {
    const database = session.getSchema(process.env.DATABASE); 
    const myTable = database.getTable(process.env.TABLE); 
    var salaireTotal = parseInt(newSalaireAnnuel) + parseInt(myEmploye.calculAugmentation());

    return myTable
    .insert(['Matricule', 'Nom', 'Prenom', 'Age', 'Anciennete', 'Salaire'])
    .values([newMatricule, newNom, newPrenom, myEmploye.calculAge(), myEmploye.calculAnciennete(), salaireTotal])
    .execute()

})
.catch(function (err) {
    console.log(err);
  });

    res.json({
        success: true
    });
});

// update


// delete

app.listen(process.env.PORT, () => console.log('app is running'));




                                                                                                             
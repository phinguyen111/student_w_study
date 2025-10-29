const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
module.exports = (app) => {
    // cau hinh view engine & thu muc views
    app.set('views',path.join(__dirname,'../views'));
    app.set('view engine', 'ejs');

    // layouts cho EJS
    app.use(expressLayouts);
    app.set('layout','layouts/main');

    // static files
    app.use(express.static(path.join(__dirname,'../public')));

    // Parsers
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
};
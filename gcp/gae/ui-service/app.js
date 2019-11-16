'use strict';

const express = require('express');

const app = express();
const path = require('path');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.css'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.js'));
});

app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname + '/manifest.json'));
});

app.get('/android-chrome-192x192.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/android-chrome-192x192.png'));
});

app.get('/android-chrome-512x512.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/android-chrome-512x512.png'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname + '/favicon.ico'));
});

app.get('/apple-touch-icon.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/app-touch-icon.png'));
});

app.get('/favicon-16x16.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/favicon-16x16.png'));
});

app.get('/favicon-32x32.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/favicon-32x32.png'));
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname + '/robots.txt'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname + '/favicon.ico'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});


module.exports = app;
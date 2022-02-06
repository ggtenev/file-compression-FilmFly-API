module.exports = (link, image) =>
  `<html lang="en"> <head>    <meta charset="utf-8"/>    <meta name="viewport" content="width=device-width, initial-scale=1"/>    <meta name="theme-color" content="#000000"/>    <meta name="description" content="Transfer & Share Videos, Photos, & Files"/>    <title>Transfer &amp; Share Videos, Photos, &amp; Files</title>  <style>html,body,.main-app {  height: 100vh;  margin: 0;  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",sans-serif; -webkit-font-smoothing: antialiased;  -moz-osx-font-smoothing: grayscale;}.bg-image {  height: 100%;  width: 100%;  position: absolute;  z-index: -1;  background-position: center;background-repeat: no-repeat;  background-size: cover;}</style></head><body><div class="main-app"><img src=${image} class="bg-image" alt="backgroundimage" width="100%" height="100%"><div style="position: absolute; margin-top: 30rem; margin-left: 5rem;"><a href=${link}>Download</a></div></div></body></html>`;

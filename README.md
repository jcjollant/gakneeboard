# Development
Start the UI
`npm run dev`

And access via the browser, typically on port 5173
`http://localhost:5173`

Start on local network (to allow access from other devices on the network). This is good for testing on the iPad
`npm run dev -- --host`

# Testing
=> See tests/Readme.md

# Release
## Checklist
* Test
* Update Release.md
* Update Version number in data.js
* Merge Code
## Versionning
Version numbers use the following format YWWN where Y=Year WW=Week and N is the version within that week
For example the first release of the first week in 2025 was 5011. The following release that week would be 5012
Front end version number is captured in /src/assets/data.js 
`export const version = 5011`

## Release notes
Release updates are cpatured in /Release.md
Customer facing release notes are on wordpress https://gakneeboard.wordpress.com/

# Misc
Google API CliendId : 864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com

## Basic Navigation
When opening a shared template App.vue will try to resolve the code then save as local template
template will read from localstorage when template Id is 0
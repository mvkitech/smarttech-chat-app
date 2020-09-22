This is the "Chat" mini-application for the Smart Tech folks.

The server component is Node.JS and one of the reasons why Node.JS was selected
was because node is a fairly light weight and easily scalable server platform. 
The user interface uses "EJS - Embedded JavaScript" templates. 

To run this code, one must first have node.js installed on their system. I built 
this project using node "v12.18.2", and then all one needs to do after downloading
and unzipping the code from GitHub is to navigate to the folder the code was
deployed to and type "npm install" which will install all necessary npm package
dependencies this project used to the "node_modules" subfolder. To run the Chat
application as a local DEV server, type "npm run dev" and once started the server
will be able to accept requests on "localhost:3000" for access to the home page.

Finally, as stated earlier. This application connects to a MongoDB cloud instance.
The URI to this cloud instance can be configured in the "config/dev.env" as well
as "config/test.env". However the URI checked into GitHub are NOT valid. I will 
send the valid URIs to the appropriate Smart Tech people in a separate email. 

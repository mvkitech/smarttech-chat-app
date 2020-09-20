This is the "Chat" mini-application for the Smart Tech folks.

The server component is Node.JS and one of the reasons why Node.JS was selected
was because node is a fairly light weight and easily scalable server platform. 
The user interface uses "EJS - Embedded JavaScript" templates. 

Presently all Chat traffic is persisted to a MongoDB instance running on the cloud. 
But at this time the WebSocket capabilities have NOT been setup and the only way to 
see the chat traffic between users is to continually enter and exit the chatrooms. 
Obviously this is not desirable and needs to be addressed ASAP. Basically what happened 
was that I created the persistence capabilities first before trying to hook up the
WebSockets. But when the WebSocket code was beginning to be addeded, the Express
routers stopped being called on any new chat message form submit events which of 
course also meant that the chat messages were no longer being persisted. It is
believed that to fix this issue, I need to build the WebSocket layers first and 
then inside of the server code, alter how and when the chat messages get saved.
Unfortunately I feel that I have run out of time to do this and would rather 
show the chat messages persisting as they are now, with the annoyance of having
to constantly enter/exit each chat room versus try to hack together the solution
and run the risk that both the WebSocket as well as the message persistence failed.

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

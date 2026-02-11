Welcome to Cachena. Cachena was built to be a sleek GPS module that works in tandem with a receiver to keep track of objects in a workplace environment. 

# Hardware How-To

- For hardware implementation, at our current state the GPS module is always on. Simply attach the module utilizing whatever method of your choosing as there is plenty of opportunity on the GPS module. 
- Once attached, the receiver communicate with the GPS module on the tracked user object (TUO), storing all that data which can be interfaced with through our webapp from a smartphone.
- With the added functionality of the accelerometer, the module will turn on when movement is sensed, allowing for longer battery life. 

# Software How-To

- When entering our webapp (http://localhost:8000/), you'll be greeted by a login page. Here we can create account or sign in using existing credentials (username / password). 
- To create an account, simply click on the create account button, then enter in your username and password that follow the conventions as labeled. 
- Once signed in you'll be directed to a home page, as an admin you will be able to give access to other users in your company in settings (Top right) under the "Users" tab. 
- Admins have the ability to add/remove users, set password reset timings, and manage devices attached to users. 
- As a user, assign new devices to yourself in the new device tab located on the top taskbar. 
- While adding new devices, create/add tags to help categorize and manage large amounts of GPS modules. Within the home page, filter/search to easily find the GPS modules you're looking for. 
- To view your user information, click into the settings icon and go to the information tab. 

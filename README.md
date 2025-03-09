![yappr_long_logo](https://github.com/user-attachments/assets/4824bd5c-0f98-40a7-bae2-9b7b6b347cc0)
# Yappr - WORK IN PROGRESS

A simple chat application built with python & react so you can finally talk to yourself.

This is just a portfolio coding project that's still in progress.

### Demo Screenshots
This is still a work in progress, more will be added.


https://github.com/user-attachments/assets/9107dcd2-410c-4277-b52c-c85e54427f1f

#### With channel member list
![yappr_new_screenshot](https://github.com/user-attachments/assets/b9989511-dd35-40d0-ac3e-322376ee7121)

### To-Do List
- Refactor of code
- Ability to create channels
- Implement the ability to add other users
  - Automatic channel creation when adding another user for direct messaging
- Implement encryption
  - On user register, create a public and private key
  - Derive an additional key from users password using key derivation
  - Utilised the derived key to encrypt the user's private key before sending both public and private to server for storage
  - Next time the user logs in, it will derive the key from their password, retrieve their private key from the database and decrypt it
- Add more features to the UI
  - Profile management
  - Profile customisation
  - Ability to view another user's profile
- Add group chats

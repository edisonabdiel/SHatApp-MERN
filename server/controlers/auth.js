const {connect} = require(getstream);
const bcrypt = require('bcrypt');
const StreamChat = require('stream-chat');
const crypto = require('crypto');

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;


const signup = async (req, res) => {
    try {

        const { fullName, username, password, phoneNumber } = req.body;

        const userId = crypto.randomBytes(16).toString('hex');

        const serverClient = connect(api_key, api_secret, app_id);

        const hashedPassword = await bcrypt.hash(password, 10);

        const token = await serverClient.createUserToken(userId);

        res.status(200).json({ token, fullName, username, userId, phoneNumber, hashedPassword });
    
    } catch (err) {
        console.log(err);

        res.status(500).json({ message: err });
    };
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const serverClient = connect(api_key, api_secret, app_id);

        const client = StreamChat.getInstance(api_key, api_secret);

        const { users } = await client.queryUsers({ name: username });

        if (!users.length) return res.status(400).json({ message: 'User not found' });
        
        const success = await bcrypt.compare(password, users[0].hashedPassword);

        const token = await serverClient.createUserToken(users[0].id);

        if (success) {
            res.status(200).json({ token, fullName: users[0], password, username, userId: users[0].id });
        } else {
            res.status(500).json({ message: 'Password incorrect' });
        }

         }


    } catch (err) {
        console.log(err);

        res.status(500).json({ message: err });
    };
};

        module.exports = { signup, login };

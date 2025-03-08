

const User = require('../model/user');

const userService = {

    async userLogin(loginData) {
        const { email, password } = loginData;
    
        if (!email || !password) {
            return { success: false, statusCode: 400, error: 'Email and password are required' };
        }
    
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, statusCode: 404, error: 'User not found' };
            }
    
            if (user.password !== password) {
                return { success: false, statusCode: 401, error: 'Invalid password' };
            }
    
            return { success: true, statusCode: 200, message: 'Login successful', email };
        } catch (error) {
            console.error('❌ Login Error:', error);
            return { success: false, statusCode: 500, error: 'Internal server error' };
        }
    },


    async  userRegister(registerData) {
        const { email, password } = registerData;
    
        if (!email || !password) {
            return { success: false, statusCode: 400, error: 'Email and password are required' };
        }
    
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return { success: false, statusCode: 409, error: 'User already exists' };
            }
    
            const newUser = new User({ email, password }); // Store password properly (hash it in production)
            await newUser.save();
    
            return { success: true, statusCode: 201, message: 'User registered successfully', email };
        } catch (error) {
            console.error('❌ Registration Error:', error);
            return { success: false, statusCode: 500, error: 'Internal server error' };
        }
    }
    


}
    

module.exports = userService;

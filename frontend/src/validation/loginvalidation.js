export const validateLogin = (email, code) => {
    const errors = {};
    let valid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = 'Invalid email format.';
        valid = false;
    }

    if (!code) {
        errors.password = 'verification code wrong.';
        valid = false;
    }

    return {
        valid,
        errors,
    };
};

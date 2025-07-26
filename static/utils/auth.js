const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token
        ? { 'Authentication-Token': token }
        : {};
};

export { getAuthHeader };
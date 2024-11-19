async function getBusiness(req) {
    try {
        const { role } = req.currentUser;
        if (role === 'Business Owner') {
            const business = await req.currentUser.getBusiness();
            return business;
        }
        const details = await req.currentUser.getTeamMemberDetails();
        const business = await details.getBusiness();
        return business;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getBusiness;

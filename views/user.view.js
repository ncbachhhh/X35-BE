const UserView = (user) => {
    return {
        id: user._id,
        fullname: user.fullname,
        profilePicture: user.profilePicture,
        email: user.email,
        address: user.address,
        role: user.role,
        likedCars: user.likedCars,
    }
}

export default UserView;
const { DataTypes, FLOAT, TIME } = require('sequelize');

const { sequelize } = require('../config/sequelize')
const { STRING, INTEGER, DATE, BOOLEAN } = DataTypes

// Define models for each table 
// pushing to dev

//1. USER SCHEMA
const User = sequelize.define('User', {
    // Model attributes are defined here
    id: {
        type: STRING,
        unique: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: STRING,
    },
    username: {
        type: STRING,
        unique: true,
    },
    email: {
        type: STRING,
        validate: {
            isEmail: {
                args: true,
                msg: 'you didnt send an email'
            }
        },
        unique: true
    },
    type: {
        type: STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['H', 'U']],
                msg: "Account type must be either H or U"
            }
        }
    },
    phone_number: {
        type: STRING,
    },
    bio: {
        type: STRING,
    },
    password: {
        type: STRING,
    },
    heat: {
        type: INTEGER,
    },
    profile_pic: {
        type: STRING,
    },
    is_active: {
        type: BOOLEAN,
    },
    dob: {
        type: DATE,
    },
    gender: {
        type: STRING,
        validate: {
            isIn: {
                args: [['F', 'M',]],
                msg: 'gender must be M or F'
            },
        }
    },
    location: {
        type: STRING,
    },
    authtype: {
        type: STRING,
        allowNull: false,
        defaultValue: "email",
        validate: {
            isIn: {
                args: [['facebook', 'google', 'email']],
                msg: "Auth type doesnt exist"
            }
        }
    }
}, {
    // Other model options go here
    tableName: 'user',
    modelName: 'user'
});

//2. EVENT SCHEMA
const Event = sequelize.define('Event', {
    // Model attributes are defined here
    id: {
        type: STRING,
        unique: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: STRING,
        allowNull: false,
    },
    price: {
        type: INTEGER,
        allowNull: false,
    },
    location: {
        type: STRING,
    },
    longitude: {
        type: FLOAT,
    },
    latitude: {
        type: FLOAT,
    },
    date: {
        type: DATE,
    },
    host_id: {
        type: STRING,
    },
    discount: {
        type: INTEGER,
        allowNull: true
    },
    is_active: {
        type: BOOLEAN,
    },
    event_pic: {
        type: STRING,
    },
    tickets: {
        type: INTEGER,
        allowNull: true
    },
    sold: {
        type: INTEGER,
        defaultValue: 0,
    },
    time: {
        type: TIME,
    },
}, {
    // Other model options go here
    tableName: 'events',
    modelName: 'events'

});


//3. POST SCHEMA
const Post = sequelize.define('Post', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: STRING,
        allowNull: false,

    },
    content: {
        type: STRING,
        allowNull: true,
    },
    picture: {
        type: STRING,
        allowNull: true,
    },
},
    {
        // Other model options go here
        tableName: 'posts',
        modelName: 'posts'
    });

//4. COMMENT SCHEMA
const Comment = sequelize.define('Comment', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    event_id: {
        type: STRING,

    },
    user_id: {
        type: STRING,

    },
    content: {
        type: STRING,
        allowNull: false,
    },
    post: {
        type: STRING,
        allowNull: false,

    }

}, {
    // Other model options go here
    tableName: 'comments',
    modelName: 'comments'
});

//5. FAVOURITES SCHEMA
const Favourite = sequelize.define('Favourite', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: STRING,
        allowNull: false,

    },
    event_id: {
        type: STRING,
        allowNull: false,

    },
}, {
    // Other model options go here
    tableName: 'favourites',
    modelName: 'favourites'
}
);

//6. FRIEND SCHEMA
const Friend = sequelize.define('Friend', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: STRING,
        allowNull: false,

    },
    friend_id: {
        type: STRING,
        allowNull: false,
    },
    friendName: {
        type: STRING,
        allowNull: false,

    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: {
                args: [['pending', 'accepted', 'rejected']],
            },
        }

    }
}, {
    // Other model options go here
    tableName: 'friend',
    modelName: 'friend'
});

//7. PURCHASE SCHEMA
const Purchase = sequelize.define('Purchase', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: STRING,
        allowNull: false,

    },
    event_id: {
        type: STRING,
        allowNull: false,

    },
}, {
    // Other model options go here
    tableName: 'purchase',
    modelName: 'purchase'
});

//8. FOLLOWERS SCHEMA
const Follow = sequelize.define('Follow', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    host: {
        type: STRING,
        allowNull: false,
    },
    follower: {
        type: STRING,
        allowNull: false,

    },
}, {
    // Other model options go here
    tableName: 'follows',
    modelName: 'follows'
});


const Story = sequelize.define('Story', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: STRING,
        allowNull: false,
    },
    story: {
        type: STRING,
        allowNull: false,
        validate: {
            isUrl: {
                args: true,
                msg: "you didn't send a url"
            }
        }
    },
    caption: {
        type: STRING,
    }

}, {
    // Other model options go here
    tableName: 'story',
    modelName: 'story'
});



// // Define relationships between tables
// User.hasMany(Post, { foreignKey: 'user_id' });
// User.hasMany(Event, { foreignKey: 'host_id' });
// User.hasMany(Friend, { foreignKey: 'friend_id' });
// User.hasMany(Follow, { foreignKey: 'follower' });
// User.hasMany(Favourite, { foreignKey: 'user_id' });
// User.hasMany(Purchase, { foreignKey: 'user_id' });
// User.hasMany(Comment, { foreignKey: 'user_id' });
// Post.belongsTo(User);
// Post.hasMany(Comment, { foreignKey: 'post' });

// Event.belongsTo(User);
// Event.hasMany(Comment, { foreignKey: 'event_id' });
// Event.hasMany(Purchase, { foreignKey: 'event_id' });

// Friend.belongsTo(User);

// Purchase.belongsTo(User);
// Purchase.belongsTo(Event);

// Follow.belongsTo(User);

// Favourite.belongsTo(User);

// Comment.belongsTo(User);
// Comment.belongsTo(Event);
// Comment.belongsTo(Post);

sequelize.sync()

module.exports = { User, Event, Post, Comment, Favourite, Friend, Purchase, Follow, Story };

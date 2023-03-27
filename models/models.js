const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/sequelize')
const { STRING, INTEGER, DATE, BOOLEAN } = DataTypes

// Define models for each table

//1. USER SCHEMA
const User = sequelize.define('User', {
    // Model attributes are defined here
    id: {
        type: STRING,
        unique: true,
        primaryKey: true,
        allowNull: false,
    },
    name: STRING,
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
    phone: STRING,
    bio: STRING,
    password: {
        type: STRING,
    },
    heat: INTEGER,
    profile_pic: {
        type: STRING,
        validate: {
            isUrl: {
                args: true,
                msg: "you didn't send a url"
            },
        }
    },
    is_active: STRING,
    dob: DATE,
    gender: {
        type: STRING,
        validate: {
            isIn: {
                args: [['F', 'M',]],
                msg: 'gender must be M or F'
            },
        }
    },
    location: STRING,
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
    name: STRING,
    price: INTEGER,
    location: STRING,
    longitude: INTEGER,
    latitude: INTEGER,
    date: DATE,
    host_id: STRING,
    discount: INTEGER,
    is_active: STRING,
    pic: STRING,
    tickets: INTEGER,
}, {
    // Other model options go here
    tableName: 'events',
    modelName: 'events'

});


//3. POST SCHEMA
const Post = sequelize.define('Post', {
    id: {
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
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
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    event_id: {
        type: INTEGER,
        allowNull: true,
        references: {
            model: 'Event',
            key: 'id',
        },
    },
    user_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    content: {
        type: STRING,
        allowNull: false,
    },
}, {
    // Other model options go here
    tableName: 'comments',
    modelName: 'comments'
});

//5. FAVOURITES SCHEMA
const Favourite = sequelize.define('Favourite', {
    id: {
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    event_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'Event',
            key: 'id',
        },
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
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    friend_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    friendName: {
        type: STRING,
        allowNull: false,
        references: {
            model: 'User',
            key: 'name',
        }
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
    tableName: 'friends',
    modelName: 'friends'
});

//7. PURCHASE SCHEMA
const Purchase = sequelize.define('Purchase', {
    id: {
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    event_id: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'Event',
            key: 'id',
        },
    },
}, {
    // Other model options go here
    tableName: 'purchase',
    modelName: 'purchase'
});

//8. FOLLOWERS SCHEMA
const Follow = sequelize.define('Follow', {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    follower_id: {
        type: INTEGER,
        allowNull: false,
    },
    following_id: {
        type: INTEGER,
        allowNull: false,
    },
}, {
    // Other model options go here
    tableName: 'follows',
    modelName: 'follows'
});


// Define relationships between tables
User.hasMany(Post, { foreignKey: 'user_id' });
User.hasMany(Event, { foreignKey: 'host_id' });
User.hasMany(Friend, { foreignKey: 'user_id' });
User.hasMany(Follow, { foreignKey: 'following_id' });
User.hasMany(Favourite, { foreignKey: 'user_id' });
User.hasMany(Purchase, { foreignKey: 'user_id' });

Post.belongsTo(User, { foreignKey: 'user_id' });
Post.hasMany(Comment, { foreignKey: 'post_id' });

Event.belongsTo(User, { foreignKey: 'host_id' });
Event.hasMany(Comment, { foreignKey: 'event_id' });
Event.hasMany(Purchase, { foreignKey: 'event_id' });

Friend.belongsTo(User, { foreignKey: 'user_id' });

Purchase.belongsTo(User, { foreignKey: 'user_id' });
Purchase.belongsTo(Event, { foreignKey: 'event_id' });

Follow.belongsTo(User, { foreignKey: 'user_id' });

Favourite.belongsTo(User, { foreignKey: 'user_id' });

Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Event, { foreignKey: 'event_id' });

sequelize.sync()

module.exports = { User, Event, Post, Comment, Favourite, Friend, Purchase, Follow };

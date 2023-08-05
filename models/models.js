const { DataTypes, FLOAT, TIME } = require('sequelize');

const { sequelize } = require('../config/sequelize')
const { STRING, INTEGER, DATE, BOOLEAN, TINYINT, SMALLINT } = DataTypes

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
    heatTime: {
        type: DATE,
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
        allowNull: true,
        validate: {
            isIn: {
                args: [['facebook', 'google', 'buzz']],
                msg: "Auth type doesnt exist"
            },
        }
    },
    code: {
        type: INTEGER,
        allowNull: true,
        defaultValue: null
    },



    balance: {
        type: INTEGER,
        allowNull: true,
        defaultValue: 0
    },


    referral_code: {
        type: STRING(6),
        allowNull: true,
        defaultValue: ""
    },

    reported: {
        type: INTEGER,
        defaultValue: 0
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
    description: {
        type: STRING,
        defaultValue: "",
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
        allowNull: true,
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
    timeStart: {
        type: STRING,
    },
    timeEnd: {
        type: STRING
    },
    promotional_code: {
        type: STRING,
        allowNull: true,
    },
    featured: {
        type: BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    featured_starting_date: {
        type: DATE,
        allowNull: true,
    },
    featured_ending_date: {
        type: DATE,
        allowNull: true,
    },
    target_age_lower: {
        type: SMALLINT,
        allowNull: true,
    },
    target_age_upper: {
        type: SMALLINT,
        allowNull: true
    }
}, {
    // Other model options go here
    tableName: 'events',
    modelName: 'events'

});
Event.addScope('distance', (latitude, longitude, distance, unit = "km") => {
    const constant = unit == "km" ? 6371 : 3959;
    const haversine = `(
        ${constant} * acos(
            cos(radians(${latitude}))
            * cos(radians(latitude))
            * cos(radians(longitude) - radians(${longitude}))
            + sin(radians(${latitude})) * sin(radians(latitude))
        )
    )`;
    return {
        attributes: [
            [sequelize.literal(haversine), 'distance'],
        ],
        where: sequelize.where(sequelize.literal(haversine), '<=', distance)
    }
})


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
    pic1: {
        type: STRING,
        allowNull: true,
    },
    pic2: {
        type: STRING,
        allowNull: true,
    },
    pic3: {
        type: STRING,
        allowNull: true,
    },
    pic4: {
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
    username: {
        type: STRING,
        allowNull: false,
    },
    profile_pic: {
        type: STRING,
        allowNull: false,
    },
    email: {
        type: STRING,
        validate: {
            isEmail: {
                args: true,
                msg: 'you didnt send an email'
            }
        },

    },
    phone_number: {
        type: STRING,
    },

    event_id: {
        type: STRING,
        allowNull: false,

    },
    host_id: {
        type: STRING,
        allowNull: false,

    },
    seats: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    amount: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [['active', 'cancelled']],
            },
        }
    }

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

const EventCategory = sequelize.define("event_category", {
    id: {
        unique: true,
        type: STRING,
        primaryKey: true

    },
    event_id: {
        type: STRING,
        unique: true,
        allowNull: false
    },
    event_name: {
        type: STRING,
    },
    All: {
        defaultValue: 1,
        type: TINYINT
    },
    Music: {
        defaultValue: 0,
        type: TINYINT
    },
    Art: {
        defaultValue: 0,
        type: TINYINT
    },
    Tech: {
        defaultValue: 0,
        type: TINYINT
    },
    Food: {
        defaultValue: 0,
        type: TINYINT
    },
    Movies: {
        defaultValue: 0,
        type: TINYINT
    },
    Workshops: {
        defaultValue: 0,
        type: TINYINT
    },
    Sports: {
        defaultValue: 0,
        type: TINYINT
    }
}, {
    // Other model options go here
    tableName: 'event_category',
    modelName: 'event_category'
})

const Review = sequelize.define('Review', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    event_id: {
        type: STRING,
        allowNull: false,
    },
    user_id: {
        type: STRING,
        allowNull: false,
    },
    host_id: {
        type: STRING,
        allowNull: false,
    },
    username: {
        type: STRING,
    },
    profile_pic: {
        type: STRING,
    },
    review: {
        type: STRING,
        allowNull: false,
    },
    rating: {
        type: INTEGER,
        allowNull: false,
    }

}, {
    // Other model options go here
    tableName: 'reviews',
    modelName: 'reviews'
});

const Reaction = sequelize.define('Reaction', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: STRING,
        allowNull: false,
    },
    username: {
        type: STRING,
    },
    profile_pic: {
        type: STRING,
    },
    post_id: {
        type: STRING,
        allowNull: false,
    },
    reaction: {
        type: STRING,
        allowNull: false,
    }
}, {
    // Other model options go here
    tableName: 'reactions',
    modelName: 'reactions'
});
const Ticket = sequelize.define('Ticket', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    event_id: {
        type: STRING,
        allowNull: false,
    },
    name: {
        type: STRING,
    },
    price: {
        type: STRING,
        allowNull: false,
    }
}, {
    // Other model options go here
    tableName: 'tickets',
    modelName: 'tickets'
});

const HostTicketGoal = sequelize.define('HostTicketGoal', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    host_id: {
        type: STRING,
        allowNull: false,
    },
    goal: {
        type: INTEGER,
        allowNull: false,
    },
    goal_start_day: {
        type: DATE,
        allowNull: false,
    },
    goal_end_day: {
        type: DATE,
        allowNull: false,
    }
}, {
    // Other model options go here
    tableName: 'host-ticket-goal',
    modelName: 'host-ticket-goal'
});

const HostRevenueGoal = sequelize.define('HostRevenueGoal', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
    },
    host_id: {
        type: STRING,
        allowNull: false,
    },
    goal: {
        type: INTEGER,
        allowNull: false,
    },
    goal_start_day: {
        type: DATE,
        allowNull: false,
    },
    goal_end_day: {
        type: DATE,
        allowNull: false,
    }
}, {
    // Other model options go here
    tableName: 'host-revenue-goal',
    modelName: 'host-revenue-goal'
});

//5. FAVOURITES SCHEMA
const Withdrawal = sequelize.define('Withdrawal', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: STRING,
        allowNull: false,

    },
    name: {
        type: STRING,
    },
    username: {
        type: STRING,
    },
    email: {
        type: STRING,
    },
    amount: {
        type: INTEGER,
        allowNull: false,
    },
    bankName: {
        type: STRING,
    },
    accountName: {
        type: STRING,
    },
    accountNumber: {
        type: STRING,
    },
    is_paid: {
        type: BOOLEAN,
        defaultValue: false,
    },
}, {
    // Other model options go here
    tableName: 'withdrawals',
    modelName: 'withdrawals'
}
);
const Blocked = sequelize.define('Blocked', {
    id: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
    },
    blocked_user: {
        type: STRING,
        allowNull: false,

    },
    user:{
        type:STRING,
        allowNull: false,
    }
   
}, {
    // Other model options go here
    tableName: 'blocked',
    modelName: 'blocked'
}
);





// Define relationships between tables
User.hasMany(Post, { foreignKey: 'user_id' });
User.hasMany(Event, { foreignKey: 'host_id' });
User.hasMany(Friend, { foreignKey: 'user_id' });
User.hasMany(Follow, { foreignKey: 'follower' });
User.hasMany(Favourite, { foreignKey: 'user_id' });
User.hasMany(Purchase, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });

Post.belongsTo(User, { foreignKey: 'user_id' });
Post.hasMany(Comment, { foreignKey: 'post' });

Event.belongsTo(User, { foreignKey: 'host_id' });
Event.hasMany(Comment, { foreignKey: 'event_id' });
Event.hasMany(Purchase, { foreignKey: 'event_id' });

Friend.belongsTo(User, { foreignKey: 'user_id' });

Purchase.belongsTo(User, { foreignKey: 'user_id' });
Purchase.belongsTo(Event, { foreignKey: 'event_id' });

Follow.belongsTo(User, { foreignKey: 'follower' });

Favourite.belongsTo(User, { foreignKey: 'user_id' });

Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Event, { foreignKey: 'event_id' });
Comment.belongsTo(Post, { foreignKey: 'post' });

Review.belongsTo(User, { foreignKey: 'user_id' });
Review.belongsTo(Event, { foreignKey: 'event_id' });

Story.belongsTo(User, { foreignKey: 'user_id' });

Reaction.belongsTo(User, { foreignKey: 'user_id' });
Reaction.belongsTo(Post, { foreignKey: 'post_id' });

// Optional: Add associations for EventCategory
EventCategory.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasOne(EventCategory, { foreignKey: 'event_id' });

// Optional: Add associations for additional models
HostRevenueGoal.belongsTo(User, { foreignKey: 'host_id' });
HostTicketGoal.belongsTo(User, { foreignKey: 'host_id' })

// Sync the models with the database
sequelize.sync();


module.exports = {
    User,
    Event,
    EventCategory,
    Post, Comment,
    Favourite, Friend,
    Purchase, Follow,
    Review, Story,
    Reaction, Ticket,
    HostRevenueGoal,
    HostTicketGoal,
    Withdrawal,
    Blocked
};

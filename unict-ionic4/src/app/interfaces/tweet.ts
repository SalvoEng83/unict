import { User } from './user';

export interface NewTweet {
    tweet: string;
    parent_id: string;
}

export interface Tweet {
    created_at: string;
    _id: string;
    tweet: string;
    _author: User;
    parent_id: string;
    like_user_list: string[];
    check: Number;
    hashtags:string[];
    hashtags_final:string;
}

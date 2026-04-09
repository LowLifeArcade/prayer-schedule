-- ==========================
-- users
-- ==========================
drop table if exists _tmp_users;
create table if not exists _tmp_users (
    uid text primary key,
    email text not null unique,
    name text,
    avatar_url text,
    -- 'google', 'github', 'email'
    provider text not null,
    -- auth providers give you a string ID
    provider_uid text not null,
    created_at integer not null default (unixepoch())
);
insert into _tmp_users (uid, email, name, provider, provider_uid, avatar_url)
values (
        '2e866f11-2e86-7b3f-81a6-ed3b8395953c',
        'jonforst.pfdev@gmail.com',
        'Jon Frost',
        'google',
        '100744734811303307068',
        'https://lh3.googleusercontent.com/a/ACg8ocLnOxoL57vsIeQWaGutIsXmPKQPvsMC1h7T726ENdIeEodtFg=s96-c'
    );
insert into users (uid, email, name, avatar_url)
select uid,
    email,
    name,
    avatar_url
from _tmp_users;
insert into user_identities (user_id, provider, provider_uid)
select uid,
    provider,
    provider_uid
from _tmp_users;
drop table _tmp_users;
-- insert
--     or ignore into user_identities (user_id, provider, provider_uid)
-- values (),
--     ();
-- ==========================
-- prayers
-- ==========================
-- 1. Create fake temp table
CREATE TABLE IF NOT EXISTS _tmp_prayers (id TEXT, title TEXT, body TEXT);
-- 2. Seed it
INSERT INTO _tmp_prayers (id, title, body)
VALUES (
        lower(hex(randomblob(16))),
        'Morning Gratitude',
        'Thank you for this new day and all the blessings it brings.'
    ),
    (
        lower(hex(randomblob(16))),
        'Peace and Clarity',
        'Grant me peace of mind and clarity in all my decisions today.'
    ),
    (
        lower(hex(randomblob(16))),
        'Strength in Hardship',
        'Give me strength to endure the trials I am facing and wisdom to learn from them.'
    ),
    (
        lower(hex(randomblob(16))),
        'Gratitude for Family',
        'Thank you for the people in my life who love and support me.'
    ),
    (
        lower(hex(randomblob(16))),
        'Guidance',
        'Lead me in the right direction and help me to trust the path ahead.'
    ),
    (
        lower(hex(randomblob(16))),
        'Healing',
        'Bring healing to those who are suffering in body, mind, and spirit.'
    ),
    (
        lower(hex(randomblob(16))),
        'Evening Reflection',
        'Thank you for today. Forgive me where I fell short and restore me as I rest.'
    );
-- 3. Insert into real tables (IDs are now stable across both statements)
INSERT INTO prayers (id, title, user_id, preview)
SELECT id,
    title,
    '2e866f11-2e86-7b3f-81a6-ed3b8395953c' AS user_id,
    substr(body, 1, 50)
FROM _tmp_prayers;
INSERT INTO prayer_bodies (prayer_id, body)
SELECT id,
    body
FROM _tmp_prayers;
-- 4. Drop fake temp table
DROP TABLE _tmp_prayers;
-- ==========================
-- memberships
-- ==========================
-- insert into memberships (user_id, status, plan, expires_at)
-- values (
--         'user_2',
--         'active',
--         'monthly',
--         unixepoch() + 2592000
--     );
-- insert into items (title, description, is_premium)
-- values ('Free Item 1', 'Everyone can see this', 0),
--     ('Free Item 2', 'Everyone can see this too', 0),
--     ('Premium Item 1', 'Members only', 1),
--     ('Premium Item 2', 'Members only', 1);
-- insert into ratings (user_id, item_id, rating)
-- values ('user_1', 1, 4),
--     ('user_2', 1, 5),
--     ('user_2', 3, 3);
import datetime
import os
import secrets
from PIL import Image
from flask import url_for, request, abort, jsonify, make_response
from backend import app, db, bcrypt, login_manager, geolocator
from backend.models import User, Posts, Follow, Subscribed, Notification
from flask_login import login_user, current_user, logout_user, login_required
from flask_jwt_extended import (create_access_token)
from sqlalchemy import func
import datetime

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)

    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)
    return picture_fn


@app.errorhandler(404)
def not_found(error):
    return make_response((jsonify({'error': 'Not Found'})), 404)


@app.errorhandler(400)
def bad_request(error):
    return make_response((jsonify({'error': 'Bad Request'})), 400)


@app.errorhandler(403)
def forbidden(error):
    return make_response((jsonify({'error': 'Forbidden'})), 403)

@app.route("/usersAll", methods=['GET'])
def get_users():
    users = User.query.all()
    users_username = []
    users_id = []
    for user in users:
        users_username.append(user.username)
        users_id.append(user.id)
    # return users
    return jsonify(users_username)
@app.route("/users/<int:user_id>", methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    image_file = url_for('static', filename='profile_pics/' + user.image_file)
    followers_list = []
    followers_list_username = []
    followers_list_image = []
    for id in user.followers.all():
        followers_list.append(id.follower_id)
        userTemp = User.query.filter_by(id=id.follower_id).first()
        followers_list_username.append(userTemp.username)
        image = url_for('static', filename='profile_pics/' + userTemp.image_file)
        followers_list_image.append(image)
    followed_list = []
    followed_list_username = []
    followed_list_image = []
    for id in user.followed.all():
        followed_list.append(id.followed_id)
        userTemp = User.query.filter_by(id=id.followed_id).first()
        followed_list_username.append(userTemp.username)
        image = url_for('static', filename='profile_pics/' + userTemp.image_file)
        followed_list_image.append(image)
    return jsonify({'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name,
                    'gender': user.gender, 'birth_date': user.birth_date, 'email': user.email,
                    'image_file': image_file, 'followers': len(user.followers.all()),
                    'followed': len(user.followed.all()),'list_followers': followers_list,
                    'list_followers_name': followers_list_username,'list_followers_image': followers_list_image,
                    'list_followed': followed_list,'list_followed_name': followed_list_username,
                    'list_followed_image': followed_list_image})


@app.route("/users/<int:user_id>", methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user and check_user.id != user_id:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user and check_user.id != user_id:
        return 'Username Taken'
    for key,value in data.items():
        User.query.filter_by(id=user_id).update({key:value})
        db.session.commit()
    return 'Updated'

@app.route("/posts/<int:post_id>", methods=['PUT'])
def update_post(post_id):
    data = request.get_json()
    for key,value in data.items():
        Posts.query.filter_by(id=post_id).update({key:value})
        db.session.commit()
    return 'Updated'



@app.route("/image/<int:user_id>", methods=['PUT'])
def update_image(user_id):
    image = request.files['file']
    res = save_picture(image)
    User.query.filter_by(id=user_id).update({'image_file':res})
    db.session.commit()
    return {'image_file':res}


@app.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'id': user.id})


@app.route("/user/new", methods=['POST'])
def register():
    if current_user.is_authenticated:
        logout()
        print('not auth')
        abort(400)
    data = request.get_json()

    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        print('not something')
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user:
        return 'Username Taken'
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                gender=data['gender'], birth_date=datetime.datetime.now(), email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    # return user.id
    return {'res':'Created', 'id':user.id}
    # return 'Created'


@app.route("/login", methods=['GET', 'POST'])
def login():
    result = {}
    user_data = request.get_json()
    print(user_data)
    if current_user.is_authenticated:
        logout()
        print(current_user)
        print('not auth')
        abort(404)
    user_data = request.get_json()
    if not user_data or not 'password' in user_data or not 'email' in user_data:
        abort(400)

    user = User.query.filter_by(email=user_data['email']).first()
    if user and bcrypt.check_password_hash(user.password, user_data['password']):
        login_user(user, remember=True)
        access_token = create_access_token(identity={'id': user.id})
        result['token'] = access_token
        result['id'] = user.id
    else:
        abort(400)

    return result


@app.route("/logout", methods=['GET'])
@login_required
def logout():
    print('logging out')
    logout_user()
    return 'Logged Out', 201



@app.route('/is_following/<int:user_id>', methods=['GET'])
@login_required
def is_following(user_id):
    user = User.query.get_or_404(user_id)
    print('is_following')
    if current_user.is_following(user):
        return 'True'
    return 'False'


@app.route('/is_following_me/<int:user_id>', methods=['GET'])
@login_required
def is_following_me(user_id):
    user = User.query.get_or_404(user_id)

    if user.is_following(current_user):
        return 'True'
    return 'False'

def date_between(start_date, end_date, start_date_arg, end_date_arg):
    start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
    end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()

    if start_date.date() <= end_date_arg_converted:
        return end_date.date() >= start_date_arg_converted
    return False

@app.route('/follow/<int:user_id>', methods=['POST','DELETE'])
@login_required
def follow(user_id):
    print('followwwwwwwwwwwwwwwwwwwww')
    user_to_follow = User.query.get_or_404(user_id)
    if current_user.is_following(user_to_follow):
        print('do unfollow')
        current_user.unfollow(user_to_follow)
        return 'True'
    current_user.follow(user_to_follow)
    print('finish follow')
    return 'True'

@app.route('/subscribe/<int:post_id>', methods=['POST','DELETE'])
@login_required
def subscribe(post_id):
    post_to_subscribe = Posts.query.get_or_404(post_id)
    if current_user.is_subscribed(post_to_subscribe):
        print('do unsubscribe')
        current_user.unsubscribe(post_to_subscribe)
        return 'True'
    current_user.subscribe(post_to_subscribe)
    print('finish subscribe')
    return 'True'

@app.route('/is_subscribed/<int:post_id>', methods=['GET'])
@login_required
def is_subscribed(post_id):
    post = Posts.query.get_or_404(post_id)
    print('is_subscribed')
    if current_user.is_subscribed(post):
        return 'True'
    return 'False'



@app.route('/deleteUser/<int:user_id>', methods=['DELETE'])
@login_required
def deleteUser(user_id):
    print('delete user')
    user_to_delete = User.query.filter_by(id=user_id).first()
    db.session.delete(user_to_delete)
    db.session.commit()
    logout()
    return 'True'


@app.route("/post/new", methods=['POST'])
def newPost():
    data = request.get_json()

    if not data or not 'title' in data or not 'date_posted' in data or not 'start_date' in data \
            or not 'end_date' in data or not 'country' in data or not 'city' in data or not 'latitude' in data \
            or not 'longitude' in data or not 'content' in data or not 'user_id' in data:
        print('not something')
        abort(400)

    post = Posts(title=data['title'], date_posted=data['date_posted'], user_id=data['user_id'],
                 start_date=data['start_date'], end_date=data['end_date'], country=data['country'],
                 city=data['city'], latitude=data['latitude'], longitude=data['longitude'], content=data['content'])

    db.session.add(post)
    db.session.commit()
    return 'Created'

@app.route("/posts/all/<int:user_id>", methods=['GET'])
def allUserPosts(user_id):
    user= User.query.filter_by(id=user_id).first()
    posts = {}
    for id in user.posts.all():
        post_details = {'title': id.title, 'date_posted': id.date_posted, 'user_id': id.user_id,
                        'start_date': id.start_date, 'end_date': id.end_date, 'country': id.country,
                        'city': id.city, 'latitude': id.latitude, 'longitude': id.longitude,
                        'content': id.content}
        posts[id.id] = post_details
    return posts

@app.route("/posts/all/to_show/<int:user_id>", methods=['GET'])
def allPostsToSHow(user_id):
    user = User.query.filter_by(id=user_id).first()
    posts_to_show = {}
    for id in user.followed.all():
        posts_to_show[id.followed_id] = {}
        posts_to_show[id.followed_id]['posts'] = allUserPosts(id.followed_id)
        # posts_to_show[id.followed_id] = allUserPosts(id.followed_id)
        followed_user = User.query.filter_by(id=id.followed_id).first()
        posts_to_show[id.followed_id]['user_name'] = followed_user.username
        image = url_for('static', filename='profile_pics/' + followed_user.image_file)
        posts_to_show[id.followed_id]['image_file'] = image
        posts_to_show[id.followed_id]['id'] = followed_user.id
    posts_to_show[current_user.id] = {}
    posts_to_show[current_user.id]['posts'] = allUserPosts(current_user.id)
    posts_to_show[current_user.id]['user_name'] = current_user.username
    image = url_for('static', filename='profile_pics/' + current_user.image_file)
    posts_to_show[current_user.id]['image_file'] = image
    posts_to_show[current_user.id]['id'] = current_user.id
    return jsonify(posts_to_show)

@app.route("/posts/travel_partners", methods=['GET', 'POST'])
def allTravelPartners():
    parameters = request.get_json()
    posts = Posts.query.filter(func.acos(
        func.sin(func.radians(parameters['latitude'])) * func.sin(func.radians(Posts.latitude)) + func.cos(
            func.radians(parameters['latitude'])) * func.cos(func.radians(Posts.latitude)) * func.cos(
            func.radians(Posts.longitude) - (func.radians(parameters['longitude'])))) * 6371 <= parameters['radius'])\
                                                    .filter(Posts.start_date >= parameters['start_date']).filter(Posts.start_date <= parameters['end_date']).all()
    # posts = Posts.query.first()
    posts_to_show = {}
    for post in posts:
        posts_to_show[post.id] = {}
        posts_to_show[post.id]['title'] = post.title
        posts_to_show[post.id]['start_date'] = post.start_date
        posts_to_show[post.id]['end_date'] = post.end_date
        posts_to_show[post.id]['country'] = post.country
        posts_to_show[post.id]['city'] = post.city
        posts_to_show[post.id]['latitude'] = post.latitude
        posts_to_show[post.id]['longitude'] = post.longitude
        posts_to_show[post.id]['content'] = post.content
        posts_to_show[post.id]['user_id'] = post.user_id
    return jsonify(posts_to_show)

@app.route("/land/<int:user_id>", methods=['POST'])
def land(user_id):
    result = {}
    user = User.query.filter_by(id=user_id).first()
    login_user(user, remember=True)
    access_token = create_access_token(identity={'id': user.id})
    result['token'] = access_token
    result['id'] = user.id
    return result

@app.route('/deletePost/<int:post_id>', methods=['DELETE'])
def deletePost(post_id):
    print('delete post')
    post_to_delete = Posts.query.filter_by(id=post_id).first()
    db.session.delete(post_to_delete)
    db.session.commit()
    return 'True'

@app.route("/subscribed/notify/<int:post_id>", methods=['GET'])
def notify(post_id):
    users = Subscribed.query.filter_by(post_id=post_id).with_entities(Subscribed.user_id).all()
    print(users)
    for user in users:
        notif = Notification(user_id=user.user_id, post_id=post_id, viewed=False)
        db.session.add(notif)
        db.session.commit()
    return 'Notified'

@app.route("/subscribed/get_notif/", methods=['GET'])
def get_notifs():
    notifs = current_user.notifications.all()
    print(notifs)
    res=[]
    for notif in notifs:
        post = Posts.query.filter_by(id=notif.post_id).first()
        res.append({'title': post.title, 'viewed': notif.viewed, 'id': notif.id})
        notif.viewed = True
        db.session.commit()
    return jsonify(res)

@app.route("/notification/remove/<int:notif_id>", methods=['DELETE'])
def remove_notif(notif_id):
    notif_to_delete = Notification.query.filter_by(id=notif_id).first()
    db.session.delete(notif_to_delete)
    db.session.commit()
    return 'True'
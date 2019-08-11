# Setting Up TURN Server on CentOS
This section of documentation is for  setting up TURN Server with MySQL database to store user credential information, and to setup a free ssl certificate of Lets' Encrypt for TLS Connections. 
*SSL Certificate cannot be installed for IP Address, we must have a domain or subdomain. Self Signed Certificate of IP Address will not work, as browser while creating turn connection cannot give warning to bypass.* 
### 1. Initializing
Its very good to have packages updated, if you have just installed CentOS server on your machine, You can do this by following commands.
```
yum update
```
```
yum upgrade
```
### 2. Installing Dependencies
We will need some developer tools to build binaries of the turnserver.
```
yum groupinstall "Development Tools"
```
Above library will install git and other things, 
```
yum install openssl-devel libevent-devel wget
```
### 3. Installing Database MySql for TURN Server


As mentioned in the introduction, the Yum command to install MySQL in fact installs MariaDB. To install MySQL, we'll need to visit  [the MySQL community Yum Repository](https://dev.mysql.com/downloads/repo/yum/)  which provides packages for MySQL.

In a web browser, visit:

```
https://dev.mysql.com/downloads/repo/yum/
```

Note that the prominent Download links don't lead directly to the files. Instead, they lead to a subsequent page where you're invited to log in or sign up for an account. If you don't want to create an account, you can locate the text "No thanks, just start my download", then right-click and copy the link location, or you can edit the version number in the commands below.

Locate the desired version, and update it as needed in the link below:

![Screencapture highlighting current yum repo name](https://assets.digitalocean.com/articles/mysql-centos7/repo-name-small.png)

```
wget https://dev.mysql.com/get/mysql57-community-release-el7-9.noarch.rpm
```
Once the rpm file is saved, we will verify the integrity of the download by running  `md5sum`  and comparing it with the corresponding MD5 value listed on the site:
```
md5sum mysql57-community-release-el7-9.noarch.rpm
```
*Output :*
```
1a29601dc380ef2c7bc25e2a0e25d31e  mysql57-community-release-el7-9.noarch.rpm
```
Compare this output with the appropriate MD5 value on the site:

![Screencapture highlighting md5dsum](https://assets.digitalocean.com/articles/mysql-centos7/md5-sum-small.png)

Now that we've verified that the file wasn't corrupted or changed, we'll install the package:

```
rpm -ivh mysql57-community-release-el7-9.noarch.rpm
```
This adds two new MySQL yum repositories, and we can now use them to install MySQL server:
```
yum install mysql-server
```

Press  `y`  to confirm that you want to proceed. Since we've just added the package, we'll also be prompted to accept its GPG key. Press  `y`  to download it and complete the install.
<hr>
We'll start the daemon with the following command:

```
sudo systemctl start mysqld
```
<hr>
During the installation process, a temporary password is generated for the MySQL root user. Locate it in the  `mysqld.log`  with this command:

```
grep 'temporary password' /var/log/mysqld.log
```
*Output :*
```
[Note] A temporary password is generated for root@localhost: >03(cJyE;j,p
```
We have to note down the password to change it.
MySQL includes a security script to change some of the less secure default options for things like remote root logins and sample users.

Use this command to run the security script.

```
sudo mysql_secure_installation
```

This will prompt you for the default root password. As soon as you enter it, you will be required to change it.
*Output :*
```
The existing password for the user account root has expired. Please set a new password.

New password:
```

Enter a new 12-character password that contains at least one uppercase letter, one lowercase letter, one number and one special character. Re-enter it when prompted.

You'll receive feedback on the strength of your new password, and then you'll be immediately prompted to change it again. Since you just did, you can confidently say  `No`:

```
Estimated strength of the password: 100
Change the password for root ? (Press y|Y for Yes, any other key for No) :
```

After we decline the prompt to change the password again, we'll press  `Y`  and then  `ENTER`  to all the subsequent questions in order to remove anonymous users, disallow remote root login, remove the test database and access to it, and reload the privilege tables.

Now we have MySQL ready.
### 4. Building Binaries
Start by cloning the github repository of coturn server, through which we will have all files essential for building binaries. Clone the repo by following command.
```
git clone https://github.com/coturn/coturn.git
```
now, before running the  ```./configure``` file, we will install MySQL Development Library ```libmysqlclient```. For this we will install ```mariadb-devel```
```
cd coturn
```
```
yum install mariadb-devel
```
```
./configure
```
This will generate a ```Makefile```,  we can then complete the installation of the binaries, run following commands in the coturn directory.
```
make
```
```
make install
```
After getting successful message, we can use ```turnserver```, ```turnadmin```, ```turnutils``` command.
### 5. Installing SSL Certificate
The first process of installing SSL Certificate is having a domain name. This documentation is concluding that you already have a domain name pointing towards your server ip address.
We will install certbot to install free SSL certificate from Let's Encrypt Authorised Provider.
CentOS does not come with ```epel-release``` pakcages, so we have to install it, so that certbot can be installed.
```
yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```
```
yum install certbot
```
We can get server certificate for our domain name by issuing with following command.
```
certbot certonly
```
You will be prompted to answer your email address, domain name.
After installing certificate, you will get a successfull message with the file path of fullchain and privkey file.  
```
/etc/letsencrypt/live/YOUR_DOMAIN_NAME/fullchain.pem
/etc/letsencrypt/live/YOUR_DOMAIN_NAME/privkey.pem
```
### 5. Configure Turnserver
First, We will create a configuration file for turnserver, 
We will create a file located in ```/etc/```
Create and write to the file by following command
 ```
 vi /etc/turnserver.conf
 ```
 Copy and paste below content to the file ```/etc/turnserver.conf```
```
verbose
lt-cred-mech
mysql-userdb="host=localhost user=YOUR_DATABASE_USERNAME password=YOUR_DATABASE_PASSWORD dbname=coturn"
realm=YOUR_DOMAIN_NAME
cert=/etc/letsencrypt/live/YOUR_DOMAIN_NAME/cert.pem
pkey=/etc/letsencrypt/live/YOUR_DOMAIN_NAME/privkey.pem
web-admin
web-admin-ip=0.0.0.0
```
We will now need to create database ```coturn``` and also, we will have to create all required tables in the database. Run following commands
```
mysql -u root -p -e "CREATE DATABASE `coturn`";
```
```
mysql -u YOUR_DATABASE_USERNAME -p coturn < /usr/local/share/turnserver/schema.sql
```
After installing Coturn, it creates a file ```/usr/local/share/turnserver/schema.sql``` with the schema of the tables we need for our turn server to work.

We will create an admin account for turnserver via ```turnadmin```. 
Just replace variables in following command according to your setup.
```
turnadmin -M "host=localhost user=YOUR_DATABASE_USERNAME password=YOUR_DATABASE_PASSWORD dbname=coturn" -A -u YOUR_TURN_SERVER_ADMIN_USERNAME -p YOUR_TURN_SERVER_ADMIN_PASSWORD
```
### 6. Creating Users and Testing
First, make sure you have turnserver running, we can start turnserver with the following command, 
```
turnserver
```
Now, visit your domain on port 8080
```
https://YOUR_DOMAIN_NAME:8080/
```
Login with the admin credentials, and create a user and click save.
Now visit [https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) and test out your turn and stun urls,
```
turns://YOUR_DOMAIN_NAME
```
Put username and password of the user you created.
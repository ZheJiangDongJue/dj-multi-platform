<template>
    <div class="login-container">
        <div class="login-background"></div>
        <div class="login-content">
            <div class="login-box">
                <div class="logo-container">
                    <img alt="东爵 logo" src="../../assets/dongjue.svg" class="logo" />
                </div>
                <h2 class="welcome-text">欢迎登录</h2>
                <form @submit.prevent="handleLogin">
                    <div class="form-group">
                        <div class="input-icon-wrapper">
                            <i class="el-icon-user"></i>
                            <input type="text" v-model="username" placeholder="用户名" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-icon-wrapper">
                            <i class="el-icon-lock"></i>
                            <input type="password" v-model="password" placeholder="密码" />
                        </div>
                    </div>
                    <button type="submit" class="login-btn">登录系统</button>
                </form>
                <div class="login-footer">
                    <!-- <span>© 2023 东爵软件 - 管理系统</span> -->
                    <span>东爵软件 - 管理系统</span>
                </div>
            </div>
        </div>
        <el-dialog title="选择账套" :visible.sync="dialogVisible" width="380px" custom-class="select-db-dialog">
            <p class="dialog-subtitle">请选择要登录的账套</p>
            <el-radio-group v-model="selectedDbName" class="db-radio-group">
                <el-radio v-for="str in dbNames" :key="str" :label="str" class="db-radio-item">{{ str }}</el-radio>
            </el-radio-group>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="confirmSelection" class="confirm-btn">确 定</el-button>
                <el-button @click="dialogVisible = false" class="cancel-btn">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

import LoginAPI from '@/api/login'

export default {
    name: 'LoginPage',
    data() {
        return {
            username: '',
            password: '',
            dbNames: [],
            dialogVisible: false,
            selectedDbName: '',
        }
    },
    created() {
        let username = localStorage.getItem('username');
        if (username !== null) {
            this.username = username;
        }
    },
    methods: {
        async handleLogin() {
            console.log('Login attempt:', this.username, this.password)
            try {
                var data = await LoginAPI.getDbNames(this.username, this.password);

                console.log(data)
                if (data.Status == 200) {
                    this.dbNames = JSON.parse(data.Data)
                    if (this.dbNames.length > 1) {
                        this.dialogVisible = true;
                        this.selectedDbName = this.dbNames.length > 0 ? this.dbNames[0] : '';
                    }
                    else {
                        this.selectedDbName = this.dbNames[0];
                        await this.confirmSelection();
                    }
                }
                else {
                    this.$dialog.alert({
                        title: '提示',
                        message: data.Message
                    })
                }
            }
            catch (error) {
                if (error.code == 'ERR_NETWORK') {
                    // this.$message.error('无法连接服务器，请检查网络是否正常');
                }
                else {
                    this.$message.error(error.message);
                }
            }
        },
        async confirmSelection() {
            var data = await LoginAPI.login(this.selectedDbName, this.username, this.password);
            if (data.IsSuccess) {
                this.$commitUserInfo(data.UserInfo)
                this.$commitDbName(this.selectedDbName);
                //登陆成功后存用户名
                localStorage.setItem('username', this.username)
                // 设置登录时间，用于会话管理
                localStorage.setItem('loginTime', new Date().getTime().toString())
                this.$router.push('/home')
            }
            else {
                console.log(data.ErrorMessage)
                this.$message.error(data.ErrorMessage);
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    overflow: hidden;
}

.login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1c3d5a, #0b1c2d);
    z-index: -1;
}

.login-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}

.login-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 117.19vw; /* 1200px -> 117.19vw (1200/1024*100) */
    padding: 0 1.95vw; /* 20px -> 1.95vw (20/1024*100) */
    z-index: 1;
}

.login-box {
    position: relative;
    width: 41.02vw; /* 420px -> 41.02vw (420/1024*100) */
    padding: 5.21vh; /* 40px -> 5.21vh (40/768*100) */
    background: rgba(255, 255, 255, 0.9);
    border-radius: 1.56vh; /* 12px -> 1.56vh (12/768*100) */
    box-shadow: 0 1.3vh 3.26vh rgba(0, 0, 0, 0.2); /* 10px 25px -> 1.3vh 3.26vh (10/768*100, 25/768*100) */
    backdrop-filter: blur(1.3vh); /* 10px -> 1.3vh (10/768*100) */
    animation: fadeIn 0.8s ease-out;
    transition: all 0.3s ease;
}

.logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 2.6vh; /* 20px -> 2.6vh (20/768*100) */
}

.logo {
    width: 19.53vw; /* 200px -> 19.53vw (200/1024*100) */
    animation: floatLogo 6s ease-in-out infinite;
}

.welcome-text {
    text-align: center;
    margin-bottom: 3.91vh; /* 30px -> 3.91vh (30/768*100) */
    color: #1c3d5a;
    font-size: 3.13vh; /* 24px -> 3.13vh (24/768*100) */
    font-weight: 500;
}

.form-group {
    margin-bottom: 2.6vh; /* 20px -> 2.6vh (20/768*100) */
}

.input-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon-wrapper i {
    position: absolute;
    left: 1.46vw; /* 15px -> 1.46vw (15/1024*100) */
    color: #8c9db5;
    font-size: 2.34vh; /* 18px -> 2.34vh (18/768*100) */
}

input {
    width: 100%;
    padding: 1.82vh 1.46vw 1.82vh 4.39vw; /* 14px 15px 14px 45px -> 1.82vh 1.46vw 1.82vh 4.39vw (14/768*100, 15/1024*100, 14/768*100, 45/1024*100) */
    font-size: 2.08vh; /* 16px -> 2.08vh (16/768*100) */
    color: #333;
    background: rgba(255, 255, 255, 0.8);
    border: 0.13vh solid #ddd; /* 1px -> 0.13vh (1/768*100) */
    border-radius: 1.04vh; /* 8px -> 1.04vh (8/768*100) */
    box-sizing: border-box;
    transition: all 0.3s ease;
}

input:focus {
    outline: none;
    border-color: #1c3d5a;
    box-shadow: 0 0 0 0.26vh rgba(28, 61, 90, 0.2); /* 2px -> 0.26vh (2/768*100) */
}

.login-btn {
    width: 100%;
    padding: 1.82vh; /* 14px -> 1.82vh (14/768*100) */
    background: linear-gradient(135deg, #e60012, #ff3b4e);
    color: white;
    font-size: 2.08vh; /* 16px -> 2.08vh (16/768*100) */
    font-weight: 500;
    border: none;
    border-radius: 1.04vh; /* 8px -> 1.04vh (8/768*100) */
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
}

.login-btn:hover {
    background: linear-gradient(135deg, #d10010, #e82e3f);
    transform: translateY(-0.26vh); /* -2px -> -0.26vh (2/768*100) */
    box-shadow: 0 0.65vh 1.95vh rgba(230, 0, 18, 0.3); /* 5px 15px -> 0.65vh 1.95vh (5/768*100, 15/768*100) */
}

.login-btn:active {
    transform: translateY(0);
    box-shadow: 0 0.26vh 0.65vh rgba(230, 0, 18, 0.3); /* 2px 5px -> 0.26vh 0.65vh (2/768*100, 5/768*100) */
}

.login-footer {
    margin-top: 3.91vh; /* 30px -> 3.91vh (30/768*100) */
    text-align: center;
    color: #8c9db5;
    font-size: 1.82vh; /* 14px -> 1.82vh (14/768*100) */
}

/* 弹窗样式优化 */
.select-db-dialog {
    border-radius: 1.56vh; /* 12px -> 1.56vh (12/768*100) */
    overflow: hidden;
}

.dialog-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2.6vh; /* 20px -> 2.6vh (20/768*100) */
}

.db-radio-group {
    display: flex;
    flex-direction: column;
    padding: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
}

.db-radio-item {
    margin-bottom: 1.95vh; /* 15px -> 1.95vh (15/768*100) */
    padding: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
    border-radius: 0.78vh; /* 6px -> 0.78vh (6/768*100) */
    transition: all 0.3s ease;
}

.db-radio-item:hover {
    background-color: #f5f7fa;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 2.6vh; /* 20px -> 2.6vh (20/768*100) */
}

.confirm-btn {
    background: linear-gradient(135deg, #e60012, #ff3b4e);
    border-color: #e60012;
    padding: 1.3vh 2.44vw; /* 10px 25px -> 1.3vh 2.44vw (10/768*100, 25/1024*100) */
    border-radius: 0.78vh; /* 6px -> 0.78vh (6/768*100) */
    transition: all 0.3s ease;
}

.confirm-btn:hover {
    background: linear-gradient(135deg, #d10010, #e82e3f);
    transform: translateY(-0.26vh); /* -2px -> -0.26vh (2/768*100) */
    box-shadow: 0 0.65vh 1.95vh rgba(230, 0, 18, 0.3); /* 5px 15px -> 0.65vh 1.95vh (5/768*100, 15/768*100) */
}

.cancel-btn {
    padding: 1.3vh 2.44vw; /* 10px 25px -> 1.3vh 2.44vw (10/768*100, 25/1024*100) */
    border-radius: 0.78vh; /* 6px -> 0.78vh (6/768*100) */
}

/* 添加动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(2.6vh); /* 20px -> 2.6vh (20/768*100) */
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes floatLogo {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-0.78vh); /* -6px -> -0.78vh (6/768*100) */
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .login-box {
        width: 100%;
        max-width: 37.11vw; /* 380px -> 37.11vw (380/1024*100) */
        padding: 3.91vh 1.95vw; /* 30px 20px -> 3.91vh 1.95vw (30/768*100, 20/1024*100) */
    }
}
</style>
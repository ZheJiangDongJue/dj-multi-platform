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
                    this.$message.error('无法连接服务器，请检查网络是否正常');
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
    max-width: 1200px;
    padding: 0 20px;
    z-index: 1;
}

.login-box {
    position: relative;
    width: 420px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    animation: fadeIn 0.8s ease-out;
    transition: all 0.3s ease;
}

.logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.logo {
    width: 200px;
    animation: floatLogo 6s ease-in-out infinite;
}

.welcome-text {
    text-align: center;
    margin-bottom: 30px;
    color: #1c3d5a;
    font-size: 24px;
    font-weight: 500;
}

.form-group {
    margin-bottom: 20px;
}

.input-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon-wrapper i {
    position: absolute;
    left: 15px;
    color: #8c9db5;
    font-size: 18px;
}

input {
    width: 100%;
    padding: 14px 15px 14px 45px;
    font-size: 16px;
    color: #333;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

input:focus {
    outline: none;
    border-color: #1c3d5a;
    box-shadow: 0 0 0 2px rgba(28, 61, 90, 0.2);
}

.login-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #e60012, #ff3b4e);
    color: white;
    font-size: 16px;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
}

.login-btn:hover {
    background: linear-gradient(135deg, #d10010, #e82e3f);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(230, 0, 18, 0.3);
}

.login-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(230, 0, 18, 0.3);
}

.login-footer {
    margin-top: 30px;
    text-align: center;
    color: #8c9db5;
    font-size: 14px;
}

/* 弹窗样式优化 */
.select-db-dialog {
    border-radius: 12px;
    overflow: hidden;
}

.dialog-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 20px;
}

.db-radio-group {
    display: flex;
    flex-direction: column;
    padding: 10px;
}

.db-radio-item {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.db-radio-item:hover {
    background-color: #f5f7fa;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.confirm-btn {
    background: linear-gradient(135deg, #e60012, #ff3b4e);
    border-color: #e60012;
    padding: 10px 25px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.confirm-btn:hover {
    background: linear-gradient(135deg, #d10010, #e82e3f);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(230, 0, 18, 0.3);
}

.cancel-btn {
    padding: 10px 25px;
    border-radius: 6px;
}

/* 添加动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
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
        transform: translateY(-6px);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .login-box {
        width: 100%;
        max-width: 380px;
        padding: 30px 20px;
    }
}
</style>
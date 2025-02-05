<template>
    <div class="login-container">
        <div class="login-box">
            <!-- <h1>系统登陆</h1> -->
            <img alt="东爵 logo" src="../../assets/dongjue.svg" style="margin: 10px 40px;" />
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <input type="text" v-model="username" placeholder="用户名" required />
                </div>
                <div class="form-group">
                    <input type="password" v-model="password" placeholder="密码" />
                </div>
                <button type="submit">登陆</button>
            </form>
            <el-dialog title="选择账套" :visible.sync="dialogVisible" width="300px">
                <el-radio-group v-model="selectedDbName">
                    <el-radio v-for="str in dbNames" :key="str" :label="str">{{ str }}</el-radio>
                </el-radio-group>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="confirmSelection">确 定</el-button>
                    <el-button @click="dialogVisible = false">取 消</el-button>
                </span>
            </el-dialog>
        </div>
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
    methods: {
        async handleLogin() {
            console.log('Login attempt:', this.username, this.password)
            var data = await LoginAPI.getDbNames(this.username, this.password);

            console.log(data)
            if (data.Status == 200) {
                this.dbNames = JSON.parse(data.Data)
                this.dialogVisible = true;
                this.selectedDbName = this.dbNames.length > 0 ? this.dbNames[0] : '';
            }
            else {
                this.$message.error(data.Message);
                this.$dialog.alert({
                    title: '提示',
                    message: data.Message
                })
                this.$toast(data.Message)
            }
        },
        async confirmSelection() {
            var data = await LoginAPI.login(this.selectedDbName, this.username, this.password);
            if (data.IsSuccess == true) {
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
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}

.login-box {
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

form button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

form button:hover {
    background-color: #45a049;
}
</style>
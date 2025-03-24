<template>
    <div class="user-settings">
        <div class="navbar">
            <div class="back-button" @click="$router.back()">
                <i class="el-icon-arrow-left"></i>
            </div>
            <div class="title">账户设置</div>
            <div class="placeholder"></div>
        </div>

        <div class="settings-list">
            <div class="settings-item">
                <div class="item-label">当前账号</div>
                <div class="item-value" v-if="userInfo">{{ userInfo.Name || userInfo.Username }}</div>
            </div>

            <div class="settings-item" @click="showChangePasswordDialog">
                <div class="item-label">修改密码</div>
                <div class="item-value">
                    <i class="el-icon-arrow-right"></i>
                </div>
            </div>

            <div class="settings-item">
                <div class="item-label">当前数据库</div>
                <div class="item-value" v-if="dbName">{{ dbName }}</div>
            </div>

            <div class="settings-item logout" @click="handleLogout">
                <div class="item-label">退出登录</div>
                <div class="item-value">
                    <i class="el-icon-arrow-right"></i>
                </div>
            </div>
        </div>

        <!-- 修改密码对话框 -->
        <el-dialog title="修改密码" :visible.sync="passwordDialogVisible" width="30%">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="passwordDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleChangePassword">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { logout } from '@/utils/session-manager';
import loginAPI from '@/api/login';

export default {
    name: 'UserSettings',
    data() {
        const validateConfirmPassword = (rule, value, callback) => {
            if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        };
        return {
            passwordDialogVisible: false,
            passwordForm: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            passwordRules: {
                // oldPassword: [
                //     { required: true, message: '请输入原密码', trigger: 'blur' }
                // ],
                // newPassword: [
                //     { required: true, message: '请输入新密码', trigger: 'blur' },
                //     { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
                // ],
                confirmPassword: [
                    { required: true, message: '请确认新密码', trigger: 'blur' },
                    { validator: validateConfirmPassword, trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        // 从session或vuex获取用户信息
        // this.userInfo = userInfo;
        console.log(this.userInfo);
        console.log(this.dbName)
    },
    methods: {
        showChangePasswordDialog() {
            this.passwordDialogVisible = true;
            this.passwordForm = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        },
        handleChangePassword() {
            this.$refs.passwordForm.validate(async (valid) => {
                if (valid) {
                    try {
                        var pack = await loginAPI.changePassword(this.dbName, this.passwordForm.oldPassword, this.passwordForm.newPassword);
                        if (pack.IsSuccess) {
                            this.$message.success('密码修改成功');
                            this.passwordDialogVisible = false;
                        }
                        else {
                            this.$message.error('密码修改失败');
                        }
                    } catch (error) {
                        this.$message.error('密码修改失败');
                    }
                }
            });
        },
        handleLogout() {
            this.$confirm('确定要退出登录吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                logout();
                this.$message({
                    type: 'success',
                    message: '已安全退出登录'
                });
            }).catch(() => { });
        }
    }
}
</script>

<style lang="scss" scoped>
.user-settings {
    height: 100vh;
    background-color: #f5f7fa;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
    background-color: #545c64;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.title {
    font-size: 20px;
    font-weight: bold;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.back-button {
    cursor: pointer;
    font-size: 20px;
}

.placeholder {
    width: 20px;
}

.settings-list {
    margin-top: 20px;
    background-color: white;
}

.settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
}

.settings-item:last-child {
    border-bottom: none;
}

.item-label {
    font-size: 16px;
    color: #333;
}

.item-value {
    color: #999;
    font-size: 14px;
}

.logout {
    color: #f56c6c;
}

.logout .item-label {
    color: #f56c6c;
}

.logout .item-value {
    color: #f56c6c;
}
</style>
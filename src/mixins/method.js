import { mapActions, mapGetters } from 'vuex'
import debounce from '../utils/debounce'
import { Toast } from 'vant'
const methodMixin = {
  data() {
    return {
      loadingCount: 0,
      clientWidth: 0
    }
  },

  computed: {
    ...mapGetters(['isLoading', 'userInfo', 'dbName']),
    // 判断pad端是否是竖排
    $isPadPS() {
      return this.clientWidth < 1024
    },
    // 判断手机端
    $isMobile() {
      return this.clientWidth <= 750
    },
    $toast() {
      return Toast;
    }
  },

  watch: {},

  created() { },

  mounted() {
    this.clientWidth = document.documentElement.clientWidth
    window.addEventListener(
      'resize',
      debounce(() => {
        this.clientWidth = document.documentElement.clientWidth
      }, 60)
    )
    // console.log(this.clientWidth, this.$isLS)
  },

  methods: {
    ...mapActions('loading', ['commitIsLoading']),
    ...mapActions('common', ['commitUserInfo']),
    ...mapActions('common', ['commitDbName']),
    $commitUserInfo(userInfo) {
      this.commitUserInfo(userInfo)
    },
    $commitDbName(dbName) {
      this.commitDbName(dbName)
    },
    $pushLoading(data, error) {
      // 发送网络请求时，data会传入true，由此计算有几次网络请求
      // data传入为false时表示网络请求成功。
      // 当loadingCount为0时，表示全部请求成功，则关闭全局加载，否则一直开启
      if (data) {
        this.loadingCount++
      } else {
        this.loadingCount--
      }
      // 如果网络请求失败，则loadingCount设为0，关闭全局弹框
      if (error) {
        this.loadingCount = 0
      }
      if (this.loadingCount === 0) {
        this.commitIsLoading(false)
      } else {
        this.commitIsLoading(true)
      }
    }
  }
}

export default methodMixin
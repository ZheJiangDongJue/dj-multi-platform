<template>
    <div class="card" :class="{ 'touched': isTouched }" @touchstart="handleTouchStart" @touchend="handleTouchEnd" @click="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div class="card-icon">
            <slot name="icon"></slot>
        </div>
        <div class="card-name">
            <slot>{{ header }}</slot>
        </div>
        <div class="card-highlight"></div>
    </div>
</template>

<script>
export default {
    name: 'CardComponent',
    data() {
        return {
            isTouched: false,
            isHovered: false
        }
    },
    methods: {
        handleTouchStart() {
            this.isTouched = true;
        },
        handleTouchEnd() {
            this.isTouched = false;
        },
        handleClick() {
            this.$emit('card-click', this.bind);
        },
        handleMouseEnter() {
            this.isHovered = true;
        },
        handleMouseLeave() {
            this.isHovered = false;
        }
    },
    props: {
        header: {
            type: String,
            default: 'NAME',
        },
        bind: {
            type: Object,
            default: () => { },
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/assets/style/custom-viewport.scss';

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // padding: vh(2.6);
    width: 100px;
    height: 100px;
    border-radius: vh(2.08);
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(vh(1.04));
    box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transform: translateZ(0);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                background-color 0.3s ease;
    cursor: pointer;
    margin: vh(1.3) vw(0.98);
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: vh(0.13);
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
        z-index: 1;
    }
    
    &:hover {
        transform: translateY(vh(-0.65)) scale(1.03);
        box-shadow: 0 vh(0.78) vh(2.08) rgba(79, 172, 254, 0.25);
        background-color: rgba(255, 255, 255, 0.95);
        
        &::before {
            transform: scaleX(1);
        }
    }
}

.card-highlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
    opacity: 0;
    transition: opacity 0.6s ease;
    pointer-events: none;
    z-index: 0;
}

.card:hover .card-highlight {
    opacity: 0.6;
}

.card-icon {
    width: vh(6.51);
    height: vh(6.51);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: vh(1.3);
    transition: transform 0.3s ease;
    z-index: 2;
}

.card-name {
    text-align: center;
    font-size: vh(1.82);
    font-weight: 500;
    color: #333;
    max-width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
    z-index: 2;
}

.card:hover .card-name {
    color: #4facfe;
}

.card.touched {
    transform: scale(0.95);
    box-shadow: inset 0 vh(0.26) vh(0.52) rgba(0, 0, 0, 0.1);
    background-color: rgba(245, 247, 250, 0.95);
    
    & .card-icon {
        transform: scale(0.9);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.card:active {
    animation: pulse 0.3s ease;
}
</style>

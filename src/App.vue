<template>
  <el-container>
    <el-drawer
      title="通话设置"
      :visible.sync="drawer"
      :with-header="false">
      <el-form style="padding: 20px;" size="small">
        通话设置
        <el-divider></el-divider>
        <el-form-item label="分辨率">
          <el-select v-model="datas.resolution" style="width: 100%;">
            <el-option
              v-for="item, i in resolutionOptions"
              :key="i"
              :label="item.label"
              :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="初始码率">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="最小码率">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="最大码率">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="帧率设置">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="音频输入设备">
          <el-select v-model="datas.audioDeviceId" style="width: 100%;">
            <el-option v-for="item, i in audioDevices"
              :key="i"
              :label="item.label || '未命名'"
              :value="item.deviceId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="视频输入设备">
          <el-select v-model="datas.videoDeviceId" style="width: 100%;">
            <el-option v-for="item, i in videoDevices"
              :key="i"
              :label="item.label || '未命名'"
              :value="item.deviceId"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-drawer>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive, onUnmounted } from '@vue/composition-api';

// 分辨率配置
const options = Object.keys(RongRTC.Resolution).map(key => {
  const arr = key.split('_').map(str => parseInt(str));
  const [width, height] = arr;
  return {
    width,
    height,
    label: arr.join(' * '),
    value: arr.join('*'),
  };
}).sort((a, b) => a.width - b.width);

export default defineComponent({
  setup (_, { root }) {
    const drawer = ref(false);
    const resolutionOptions = reactive(options);
    const audioDevices: MediaDeviceInfo[] = reactive([]);
    const videoDevices: MediaDeviceInfo[] = reactive([]);

    const datas = reactive({
      resolution: options[8].value,
      defaultRate: 300,
      maxRate: 1000,
      minRate: 100,
      frameRate: '',
      audioDeviceId: '',
      videoDeviceId: '',
    });

    const parseDevices = async () => {
      let devices: MediaDeviceInfo[];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch (err) {
        console.error(err);
        return;
      }
      devices.forEach(device => {
        const deviceId = device.deviceId;
        switch (device.kind) {
          case 'audioinput':
            audioDevices.push(device);
            break;
          case 'videoinput':
            videoDevices.push(device);
            break;
        }
      });
      if (audioDevices.length > 0) {
        datas.audioDeviceId = audioDevices[0].deviceId;
      }
      if (videoDevices.length > 0) {
        datas.videoDeviceId = videoDevices[0].deviceId;
      }
    };

    onMounted(async () => {
      document.getElementById('btn_settings').onclick = () => {
        drawer.value = true;
      };
      parseDevices();
      // 取值方法
      RongSeal.getDataFromVue = () => {
        return Object.assign({}, datas);
      };
    });

    return {
      drawer,
      datas,
      resolutionOptions,
      audioDevices,
      videoDevices,
    };
  },
});

</script>

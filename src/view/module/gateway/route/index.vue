<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;添加
          </Button>
        </ButtonGroup>
        <Alert show-icon>谨慎添加或修改路由,如果修改不当,将影响正常访问！&nbsp;<a @click="handleRefreshGateway">手动刷新网关</a></Alert>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="启用"/>
          <Badge v-else="" status="error" text="禁用"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="remove">删除</DropdownItem>
            </DropdownMenu>
          </Dropdown>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-cancel="handleReset">
      <Form ref="routeForm" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="路由地址" prop="path">
          <Input v-model="formItem.path" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="路由方式" >
          <Select v-model="selectType">
            <Option value="service" label="服务名称"></Option>
            <Option value="url" label="服务地址"></Option>
          </Select>
        </FormItem>
        <FormItem v-if="selectType==='service'" label="服务名称" prop="serviceId" :rules="{required: true, message: '服务名称不能为空', trigger: 'blur'}">
          <Select v-model="formItem.serviceId">
            <Option v-for="item in selectServiceList"  :value="item.serviceId" >{{ item.serviceName }}</Option>
          </Select>
        </FormItem>
        <FormItem v-if="selectType==='url'" label="服务地址" prop="url" :rules="{required: true, message: '服务地址不能为空', trigger: 'blur'}">
          <Input  v-model="formItem.url" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model="formItem.status">
            <Radio label="0">禁用</Radio>
            <Radio label="1">启用</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="忽略前缀">
          <RadioGroup v-model="formItem.stripPrefix">
            <Radio label="0">否</Radio>
            <Radio label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="失败重试">
          <RadioGroup v-model="formItem.retryable">
            <Radio label="0">否</Radio>
            <Radio label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.routeDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary"  :loading="saving" @click="handleSubmit">保存</Button>&nbsp;
        <Button type="default" @click="handleReset">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getRoutes, updateRoute, addRoute, removeRoute} from '@/api/route'
  import {getServiceList} from '@/api/data'
  import {refreshGateway} from '@/api/gateway'
  export default {
    name: 'GatewayRoute',
    data () {
      return {
        loading: false,
        saving: false,
        modalVisible: false,
        modalTitle: '',
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        selectType:'service',
        selectServiceList:[{serviceId:'all',serviceName:'所有'}],
        formItemRules: {
          path: [
            {required: true, message: '路由地址不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          routeId:'',
          path: '',
          serviceId: '',
          url: '',
          stripPrefix: 1,
          retryable: 0,
          status: 1,
          routeDesc: ''
        },
        columns: [
          {
            title: '路由地址',
            key: 'path',
            width: 300
          },
          {
            title: '服务名称',
            key: 'serviceId',
            width: 300
          },
          {
            title: '服务地址',
            key: 'url',
            width: 300
          },
          {
            title: '忽略前缀',
            key: 'stripPrefix',
            width: 100
          },
          {
            title: '失败重试',
            key: 'retryable',
            width: 100
          },
          {
            title: '状态',
            key: 'status',
            slot:'status',
            width: 100
          },
          {
            title: '描述',
            key: 'routeDesc',
            width: 300
          },
          {
            title: '操作',
            slot: 'action',
            fixed:'right',
            width: 120
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑角色'
          this.formItem = Object.assign({}, this.formItem, data)
        } else {
          this.modalTitle = '添加角色'
        }
        this.formItem.status=this.formItem.status+''
        this.formItem.stripPrefix=this.formItem.stripPrefix+''
        this.formItem.retryable=this.formItem.retryable+''
        this.modalVisible = true
      },
      handleReset () {
        const newData = {
          routeId:'',
          path: '',
          serviceId: '',
          url: '',
          stripPrefix: 1,
          retryable: 0,
          status: 1,
          routeDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.$refs['routeForm'].resetFields()
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        this.$refs['routeForm'].validate((valid) => {
          if (valid) {
            this.saving = true
            if (this.formItem.routeId) {
              updateRoute(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                  this.handleReset()
                }
                this.handleSearch()
              }).finally(() => {
                this.saving = false
              })
            } else {
              addRoute(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              }).finally(() => {
                this.saving = false
              })
            }
          }
        })
      },
      handleSearch () {
        this.loading = true
        getRoutes({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
          this.loading = false
        })
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      },
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '确定删除吗？',
          onOk: () => {
            removeRoute(data.routeId).then(res => {
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
              this.handleSearch()
            })
          }
        })
      },
      handleClick (name, row) {
        switch (name) {
          case 'remove':
            this.handleRemove(row)
            break
        }
      },
      handleLoadServiceList(){
        getServiceList().then(res =>{
          if(res.code===0){
            this.selectServiceList.push(...res.data)
          }
        })
      },
      handleRefreshGateway () {
        this.$Modal.confirm({
          title: '提示',
          content: '将重新加载所有网关实例包括（访问权限、流量限制、IP访问限制、路由缓存），是否继续？',
          onOk: () => {
            refreshGateway().then(res => {
              if (res.code === 0) {
                this.$Message.success('刷新成功')
              }
            })
          }
        })
      }
    },
    mounted: function () {
      this.handleSearch()
      this.handleLoadServiceList()
    }
  }
</script>

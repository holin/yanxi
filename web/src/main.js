import Vue from 'vue'
import Vuetable from './components/Vuetable.vue'
import VuetablePagination from './components/VuetablePagination.vue'
import VuetablePaginationDropdown from './components/VuetablePaginationDropdown.vue'
import VuetablePaginationInfo from './components/VuetablePaginationInfo.vue'

let E_SERVER_ERROR = 'Error communicating with the server'

Vue.component('custom-actions', {
  template: [
    '<div>',
      '<button class="ui red button" @click="onClick(\'view-item\', rowData)"><i class="zoom icon"></i></button>',
      '<button class="ui blue button" @click="onClick(\'edit-item\', rowData)"><i class="edit icon"></i></button>',
      '<button class="ui green button" @click="onClick(\'delete-item\', rowData)"><i class="delete icon"></i></button>',
    '</div>'
  ].join(''),
  props: {
    rowData: {
      type: Object,
      required: true
    }
  },
  methods: {
    onClick: function(action, data) {
      console.log('actions: on-click', data.name)
      sweetAlert(action, data.name)
    },
  }
})

Vue.component('my-detail-row', {
  template: [
    '<div @click="onClick">',
      '<div class="inline field">',
        '<label>SQLs: </label>',
        '<div class="list-item" v-for="items in rowData.sqls">',
          '<span v-for="(item, index) in items">',
            '<span class="time" v-if="index == 0">{{item}}ms</span>',
            '<span class="sql" v-if="index == 1">{{item}}</span>',
          '</span>',
        '</div>',
      '</div>',
      '<div><br></div>',
      '<div class="inline field">',
        '<label>Rendered: </label>',
        '<div class="list-item" v-for="items in rowData.partials">',
          '<span v-for="(item, index) in items">',
            '<span class="time" v-if="index == 0">{{item}}ms</span>',
            '<span class="partial" v-if="index == 1">{{item}}</span>',
          '</span>',
        '</div>',
      '</div>',
    '</div>'
  ].join(''),
  props: {
    rowData: {
      type: Object,
      required: true
    }
  },
  methods: {
    onClick: function(event) {
      console.log('my-detail-row: on-click', event.target)
    }
  },
})


let tableColumns = [
  {
    name: 'id',
    title: '',
    dataClass: 'center aligned'
  },
  {
    name: 'path',
    title: 'Path',
    dataClass: 'aligned',
  },
  {
    name: 'action',
    title: 'Controller#Action',
  },
  {
    name: 'complete',
    title: 'Result',
    sortField: 'duration',
    callback: 'showComplete'
  }
]

let vm = new Vue({
  el: '#app',
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationDropdown,
    VuetablePaginationInfo,
  },
  data: {
    loading: '',
    filterVal: 0,
    filterKind: '',
    moreParams: {},
    fields: tableColumns,
    sortOrder: [{
        field: 'id',
        direction: 'desc',
    }],
    multiSort: true,
    paginationComponent: 'vuetable-pagination',
    perPage: 10,
    paginationInfoTemplate: 'Showing record: {from} to {to} from {total} item(s)',
  },
  watch: {
    'perPage' (val, oldVal) {
      this.$nextTick(function() {
        this.$refs.vuetable.refresh()
      })
    },
    'paginationComponent' (val, oldVal) {
      this.$nextTick(function() {
        this.$refs.pagination.setPaginationData(this.$refs.vuetable.tablePagination)
      })
    }
  },
  methods: {
    transform: function(data) {

      let transformed = {}
      transformed.pagination = {
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
        from: data.from,
        to: data.to
      }

      transformed.data = []
      data = data.data
      for (let i = 0; i < data.length; i++) {
        var json = data[i];
        json["duration"] = parseFloat(json.complete[1])
        json["sqls_html"] = json["sqls"].join("<br>")
        json["partials_html"] = json["partials"].join("<br>")

        var sqls = json['sqls'];
        var tmp_sqls = [];
        if (this.filterKind === "sql") {
          for (var index = 0; index < sqls.length; index++) {
            var sql = sqls[index];
            if (parseFloat(sql[0]) > this.filterVal) {
              tmp_sqls.push(sql);
            }
          }
        } else {
          tmp_sqls = sqls;
        }
        json['sqls'] = tmp_sqls.sort(function(a, b) {
          return b[0] - a[0];
        });

        var partials = json['partials']
        var tmp_partials = [];
        if (this.filterKind === "rendered") {
          for (var index = 0; index < partials.length; index++) {
            var sql = partials[index];
            if (sql[0] > this.filterVal) {
              tmp_partials.push(sql);
            }
          }
        } else {
          tmp_partials = partials;
        }
        json['partials'] = tmp_partials.sort(function(a, b) {
          return b[0] - a[0];
        });

        if (this.filterKind === "sql") {
          if (json['sqls'].length == 0) {
            continue
          }
        } else if (this.filterKind === "rendered") {
          if (json['partials'].length == 0) {
            continue
          }
        }

        if (this.filterKind === "complete") {
          if (json["duration"] > this.filterVal) {
            transformed['data'].push(json);
          }
        } else {
          transformed['data'].push(json);
        }

      }
      var sortField = this.$refs.vuetable.sortOrder[0].sortField;

      if (sortField) {
        var direction = this.$refs.vuetable.sortOrder[0].direction;
        transformed['data'] = transformed['data'].sort(function(a, b) {
          if (direction === 'asc') {
            return a[sortField] - b[sortField];
          } else {
            return b[sortField] - a[sortField];
          }
        });
      }

      return transformed
    },
    showSettingsModal () {
      $('#settingsModal').modal({
        detachable: false,
        onVisible: function() {
          $('.ui.checkbox').checkbox()
        }
      }).modal('show')
    },
    showLoader: function() {
      this.loading = 'loading'
    },
    hideLoader: function() {
      this.loading = ''
    },
    getFieldTitle: function(field) {
      if (field.title !== '') return field.title

      if (field.name.slice(0, 2) === '__') {
        return field.name.indexOf(':') >= 0
          ? field.name.split(':')[1]
          : field.name.replace('__', '')
      }
    },
    showComplete (value) {
      return value[0];
    },
    setFilter: function() {
      this.$nextTick(function() {
        this.$refs.vuetable.refresh()
      })
    },
    resetFilter: function() {
      this.filterVal = 0
      this.setFilter()
    },
    preg_quote: function( str ) {
      return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    },
    highlight: function(needle, haystack) {
      return haystack.replace(
        new RegExp('(' + this.preg_quote(needle) + ')', 'ig'),
        '<span class="highlight">$1</span>'
      )
    },
    rowClassCB: function(data, index) {
      return (index % 2) === 0 ? 'odd' : 'even'
    },
    onCellClicked (data, field, event) {
      console.log('cellClicked', field.name)
      if (field.name !== '__actions') {
        this.$refs.vuetable.toggleDetailRow(data.id)
      }
    },
    onCellDoubleClicked (data, field, event) {
      console.log('cellDoubleClicked:', field.name)
    },
    onLoadSuccess (response) {
      // set pagination data to pagination-info component
      this.$refs.paginationInfo.setPaginationData(response.data)
      let data = response.data.data
    },
    onLoadError (response) {
      if (response.status == 400) {
        sweetAlert('Something\'s Wrong!', response.data.message, 'error')
      } else {
        sweetAlert('Oops', E_SERVER_ERROR, 'error')
      }
    },
    onPaginationData (tablePagination) {
      this.$refs.paginationInfo.setPaginationData(tablePagination)
      this.$refs.pagination.setPaginationData(tablePagination)
    },
    onChangePage (page) {
      this.$refs.vuetable.changePage(page)
    },
  },
})

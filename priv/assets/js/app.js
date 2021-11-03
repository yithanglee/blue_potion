// for phoenix_html support, including form and button helpers
// copy the following scripts into your javascript bundle:
// * deps/phoenix_html/priv/static/phoenix_html.js

// this function need to run after the user form are created...
window.phoenixModels = []

function imageIsLoaded() {
    // alert(this.src);  // blob url
    // update width and height ...
    $("img#myImg").show();
    App.notify("Image uploaded!", {
        type: "success"
    });
}
$(document).on("change", "input[type='file']", function() {
    if (this.files && this.files[0]) {
        // console.log()
        if (this.files[0].type.includes("video")) {
            var img = document.querySelector("#myVideo"); // $('img')[0]
            var url = URL.createObjectURL(this.files[0]); // set src to blob url
            // img.onload = imageIsLoaded;
            var source =
                '<source  src="' +
                url +
                '" type="video/mp4">Your browser does not support HTML video.';
            $("#myVideo").html(source);
            $("#myVideo").show();
        } else {
            var img = document.querySelector("#myImg"); // $('img')[0]
            img.src = URL.createObjectURL(this.files[0]); // set src to blob url
            img.onload = imageIsLoaded;
        }
    }
});

function hashPW(pw) {
    var hashObj = new jsSHA("SHA-512", "TEXT", {
        numRounds: 1
    });
    hashObj.update(pw);
    var hash = hashObj.getHash("HEX");
    return hash;
}

function toggleActive(item, list) {
    list.forEach((v, i) => {
        v.active = false;
    })
    item.active = !item.active
}

let App = {
    notify(message, options) {
        if (options == null) {
            options = {}
        }
        var default_options = {
            static: false,
            type: 'danger'
        }
        var keys = Object.keys(default_options)
        keys.forEach((v, i) => {
            this[v] = default_options[v]
        })
        keys.forEach((v, i) => {
            if (options[v] != null) {
                this[v] = options[v]
            }
        })

        var html = `
            <div class="alert alert-dismissible alert-` + this.type + `">
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
              ` + message + `
            </div>
        `

        $("nav[aria-label='breadcrumb']").before(html)
        $(".alert").each((i, v) => {
            setTimeout(function() {
                $(v).fadeOut()
                setTimeout(function() {
                    $(v).remove()
                }, 2000)
            }, 5000)

        })
    },
    Page: {
        createTable(id, dom) {
            var html = `
            <div class="table-responsive">
                <table class="table"  style="width: 100%;" id="` + id + `">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
    `
            $(dom).append(html)
        },
        tablist(dom, list) {
            var left_tab = []
            var right_tab = []
            list.forEach((v, i) => {

                var a = `<button  
                                class="p-2 d-flex justify-content-between align-items-center nav-link  text-center  ` + (i == 0 ? 'active' : '') + `"       
                                id="` + v.title + `-tab"
                                data-bs-toggle="pill"  
                                data-bs-target="#` + v.title + `"
                                type="button"
                                role="tab" > 
                            <i class="` + v.icon + `"></i>
                            <span class="px-3">` + v.title + `</span>
                            </button>`
                left_tab.push(a)

                var b = `

                        <div class="tab-pane fade ` + (i == 0 ? 'show active' : '') + `" 
                        id="` + v.title + `"
                        role="tabpanel" 
                        aria-labelledby="` + v.title + `-tab"
                        href="#` + v.title + `"
                        >
                            ` + v.content + `
                            
                        </div>
                `
                right_tab.push(b)
            })


            $(dom).html(`
					<div class="row" >
					  <div class="col-lg-2 col-11  pb-4 nav flex-column nav-pills mx-4" id="v-pills-tab" role="tablist" aria-orientation="vertical">
					    ` + left_tab.join("") + `
					  </div>
					  <div class="col-sm-8 tab-content" id="v-pills-tabContent">
					    ` + right_tab.join("") + `
					  </div>
					</div>
				`)

        }
    },
    Functions: {
        convertPassword() {
            var u = document.querySelector("input[name='User[password]']")
            if (u != null) {
                u.addEventListener("change", () => {
                    var v = u.value
                    document.querySelector("input[name='User[crypted_password]']").value = hashPW(v)
                    u.value = null
                })
            }

        }
    }
}


class phoenixModel {
    constructor(options) {
        var default_options = {
            moduleName: "User",
            link: "users",
            tableSelector: "#users",
            data: [],
            allData: [],
            buttons: [],
            table: null,
            columns: [],
            customCols: null,
            aliasName: null
        }

        var keys =
            Object.keys(default_options)
        keys.forEach((v, i) => {
            this[v] = default_options[v]
        })
        keys.forEach((v, i) => {
            if (options[v] != null) {
                this[v] = options[v]
            }
        })
    }
}

class SubModule {
    constructor(moduleName, link, customCols) {
        this.moduleName = moduleName;
        this.link = link;
        this.customCols = customCols;
    }
}


function populateTable(dataSource) {
    var custSorts = [
        [0, "desc"]
    ]
    var custPageLength = 25 
    var custDom = '<"row"<"col-lg-4"l><"col-lg-4 my-lg-0 my-4"><"col-lg-4 text-center module_buttons">><"row grid_view d-none"><"list_view"t><"row p-4"<"col-lg-6"i><"col-lg-6"p>>'
    if (dataSource.data.dom != null) {
        custDom = dataSource.data.dom
    }
    if (dataSource.data.sorts != null) {
        custSorts = dataSource.data.sorts
    }
    if (dataSource.data.pageLength != null) {
        custPageLength = dataSource.data.pageLength
    }

    var tr = document.createElement("tr");
    var ftr = document.createElement("tr");
    $(dataSource.columns).each(function(i, v) {
        var td = document.createElement("td");
        td.innerHTML = v.label;
        tr.append(td);
    });
    $(dataSource.columns).each(function(i, v) {
        var td = document.createElement("td");
        ftr.append(td);
    });

    $(dataSource.tableSelector).find("thead").append(tr);
    $(dataSource.tableSelector).find("tfoot").html(ftr);
    console.log(dataSource.data);
    var keys = Object.keys(dataSource.data);
    var xparams = [];
    $(keys).each((i, k) => {
        if (!["sorts", "dom", "footerFn", "rowFn"].includes(k)) {
            xparams.push("&" + k + "=" + dataSource.data[k]);
        }
    });

    var table_selector = dataSource.tableSelector;

    var table = $(table_selector).DataTable({
        pageLength: custPageLength,
        processing: true,
        responsive: true,
        serverSide: true,
        ajax: {
            url: "/api/" + dataSource.link + "?foo=bar" + xparams.join("")
        },
        columns: dataSource.columns,
        lengthMenu: [8, 10, 12, 25, 50, 100],
        rowCallback: function(row, dtdata, index) {
            var added = $(dataSource.allData).filter(function(i, v) {
                return v.id == dtdata.id;
            });
            if (added.length == 0) {
                dataSource.allData.push(dtdata);
            }
            $(row).attr("aria-index", index);
            lastCol = $(row).find("td").length - 1;


            $("td:eq(" + lastCol + ")", row).attr("class", "td-actions text-right");
            $("td:eq(" + lastCol + ")", row).html("");
            $(dataSource.buttons).each((i, params) => {
                if (params.buttonType != null) {
                    if (params.buttonType == "grouped") {
                        console.log("creating grouped...button...")
                        params.fnParams.dataSource = dataSource;
                        params.fnParams.aParams = dataSource.data;
                        var buttonz = new groupedFormButton(
                            params.name,
                            params.color,
                            params.buttonList,
                            params.fnParams
                        );
                        $("td:eq(" + lastCol + ")", row).append(buttonz);

                    } else {
                        params.fnParams.dataSource = dataSource;
                        params.fnParams.aParams = dataSource.data;
                        var buttonz = new formButton({
                                iconName: params.iconName,
                                color: params.color,
                                name: params.name
                            },
                            params.fnParams,
                            params.onClickFunction);
                        $("td:eq(" + lastCol + ")", row).append(buttonz);
                    }
                } else {

                    params.fnParams.dataSource = dataSource;
                    params.fnParams.aParams = dataSource.data;
                    var buttonz = new formButton({
                            iconName: params.iconName,
                            color: params.color,
                            name: params.name
                        },
                        params.fnParams,
                        params.onClickFunction
                    );
                    $("td:eq(" + lastCol + ")", row).append(buttonz);
                }
            });
            if (dataSource.data.rowFn != null) {
                dataSource.data.rowFn(row, dtdata, index)
            }
        },
        footerCallback: function(row, data, start, end, display) {
            if (dataSource.data != null) {
                if (dataSource.data.footerFn != null) {
                    dataSource.data.footerFn(row, data, start, end, display)
                }
            }
        },
        order: custSorts,
        dom: custDom,
        autoWidth: false
    });
    dataSource.table = table



    var delete_idx =
        window.phoenixModels.findIndex((v, i) => {
            return v.tableSelector == "#subSubTable"
        })
    if (delete_idx != -1) {
        window.phoenixModels.splice(delete_idx, 1)
    }

    var check =
        window.phoenixModels.filter((v, i) => {
            return (v.moduleName == dataSource.moduleName && v.tableSelector == dataSource.tableSelector)
        })

    if (check.length == 0) {
        window.phoenixModels.push(dataSource)
    }


    window.phoenixModels.forEach((v, i) => {
        $(v.tableSelector).closest(".table-responsive").find(".module_buttons").html(`
                <button type="submit" onclick="toggleView('` + v.tableSelector + `')" class="btn btn-fill btn-primary" data-href="" data-module="" data-ref="">
                <i class="fa fa-th-large"></i></button>
                <button type="submit" onclick="window.reinit();" class="btn btn-fill btn-primary" data-href="" data-module="" data-ref="">
                <i class="fa fa-redo"></i></button>
                <button type="submit" class="btn btn-fill btn-primary" onclick="form_new('` + v.tableSelector + `')" data-href="" data-module="" data-ref=""><i class="fa fa-plus"></i></button>
                `)

    })



    return table;
}

function populateGridView(dataSource, xcard) {

    $(dataSource.tableSelector).on("draw.dt", () => {

        console.log("populating grids..")

        // do a grid view?

        $(dataSource.tableSelector).closest(".table-responsive").find(".grid_view").html("<div></div>")
        var alis = []
        dataSource.table.data().length
        for (i = 0, j = dataSource.table.data().length; i < j; i++) {
            dataSource.table.data()[i].index = i
            alis.push(dataSource.table.data()[i])
        }

        var i, j, chunk = 6;
        var temparray = [];
        for (i = 0, j = alis.length; i < j; i += chunk) {
            temparray.push(alis.slice(i, i + chunk))
        }
        temparray.forEach((row, i) => {
            var cards = []

            row.forEach((pv, pi) => {
                var data = JSON.stringify(pv)

                var sample = `
                    <div class="col-lg-3" x-data='{data: ` + data + ` }'>
                        <div class="card">
                            ` + xcard + `
                            <div x-bind:aria-index="data.index" x-bind:id="data.id"  class="card-body" ></div>
                        </div>
                    </div>
                `

                cards.push(`
                    <div class="col-6 col-sm-2" x-data='{data: ` + data + ` }'>
                            ` + xcard + `
                            <div x-bind:aria-index="data.index" x-bind:id="data.id"  class="card-body" ></div>
                        
                    </div>

                    `)
            })
            $(dataSource.tableSelector).closest(".table-responsive").find(".grid_view").append(`
            <div class="row g-2 "> ` + cards.join("") + `</div>`)

        })
        setTimeout(() => {

            $(dataSource.tableSelector).closest(".table-responsive").find(" .card-footer").each((i, v) => {
                var id = $(v).attr("aria-index")
                appendRowDtButtons(dataSource, id)
            })
        }, 200)
    })

}

function appendRowDtButtons(dataSource, index) {


    $(dataSource.buttons).each((i, params) => {
        if (params.buttonType != null) {
            if (params.buttonType == "grouped") {
                console.log("creating grouped...button...")
                params.fnParams.dataSource = dataSource;
                params.fnParams.aParams = dataSource.data;
                var buttonz = new groupedFormButton(
                    params.name,
                    params.color,
                    params.buttonList,
                    params.fnParams
                );
                $(dataSource.tableSelector).closest(".table-responsive").find(".card-footer[aria-index='" + index + "'").append(buttonz);

            } else {
                // params.fnParams.dataSource = dataSource;
                // params.fnParams.aParams = dataSource.data;
                // var buttonz = new formButton({
                //         iconName: params.iconName,
                //         color: params.color,
                //         name: params.name
                //     },
                //     params.fnParams,
                //     params.onClickFunction);
                // $("td:eq(" + lastCol + ")", row).append(buttonz);
            }
        } else {

            // params.fnParams.dataSource = dataSource;
            // params.fnParams.aParams = dataSource.data;
            // var buttonz = new formButton({
            //         iconName: params.iconName,
            //         color: params.color,
            //         name: params.name
            //     },
            //     params.fnParams,
            //     params.onClickFunction
            // );
            // $("td:eq(" + lastCol + ")", row).append(buttonz);
        }
    });

}

function appendDtButtons(table_selector, parent_container_selector) {
    $(table_selector).closest(parent_container_selector).find(".module_buttons").html(`
        <button type="submit" onclick="window.reinit();" class="btn btn-fill btn-primary" data-href="" data-module="" data-ref=""><i class="fa fa-redo"></i></button>
        <button type="submit" class="btn btn-fill btn-primary" onclick="form_new('` + table_selector + `')" data-href="" data-module="" data-ref=""><i class="fa fa-plus"></i></button>
        `)

}

function makeid(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function childGroupedFormButton(name, onClickFunction, fnParams) {
    var button = document.createElement("a")
    button.setAttribute("class", "dropdown-item")
    button.setAttribute("href", "#")
    button.innerHTML = name
    if (onClickFunction != null) {
        console.log(fnParams)
        try {
            button.id = fnParams.dtdata.id;
        } catch (e) {
            console.log("dont hav id in fnParams");
        }
        button.onclick = function() {
            fnParams.index = parseInt($($(button).closest("tr")).attr("aria-index"));
            console.log("fnparam index")
            console.log(fnParams.index)
            if (fnParams.index > -1) {} else {
                fnParams.index = parseInt($($(button).closest(".card-footer")).attr("aria-index"));
            }
            console.log($($(button).closest(".card-footer")).attr("aria-index"))
            console.log(fnParams.index)
            console.log($(button).closest(".card-footer"))
            fnParams.row = $(button).closest("tr");
            onClickFunction(fnParams);
        };
    }

    return button
}

function groupedFormButton(name, color, button_list, fnParams) {

    var ref = makeid(6)
    var div = document.createElement("div")
    div.setAttribute("class", "btn-group")
    div.setAttribute("role", "group")
    div.setAttribute("aria-label", "Button group with nested dropdown")
    div.setAttribute("style", "margin-left: 10px;")

    var button = document.createElement("button")
    button.setAttribute("type", "button")
    button.setAttribute("class", "btn btn-sm btn-" + color)
    button.innerHTML = name
    div.append(button)

    var div2 = document.createElement("div")
    div2.setAttribute("class", "btn-group")
    div2.setAttribute("role", "group")
    var button2 = document.createElement("button")
    button2.setAttribute("id", ref)
    button2.setAttribute("type", "button")
    button2.setAttribute("class", "btn btn-sm btn-" + color + " dropdown-toggle")
    button2.setAttribute("data-bs-toggle", "dropdown")
    button2.setAttribute("aria-haspopup", "true")
    button2.setAttribute("aria-expanded", "false")
    div2.append(button2)
    var div3 = document.createElement("div")
    div3.setAttribute("class", "dropdown-menu")
    div3.setAttribute("aria-labelledby", ref)
    $(button_list).each((i, v) => {
        if (v.fnParams != null) {

            v.fnParams.dataSource = fnParams.dataSource
        } else {
            v.fnParams = fnParams
        }
        var child = new childGroupedFormButton(v.name, v.onClickFunction, v.fnParams)

        div3.append(child)
    })
    div2.append(div3)
    div.append(div2)
    return div;

}

function formButton(options, fnParams, onClickFunction) {
    var default_options = {
        iconName: "fa fa-check",
        color: "btn btn-primary",
        onClickFunction: null,
        fnParams: null,
        name: "Submit"
    }
    var keys =
        Object.keys(default_options)
    keys.forEach((v, i) => {
        this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
        if (options[v] != null) {
            this[v] = options[v]
        }
    })
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("rel", "tooltip");
    button.setAttribute("class", "btn btn-" + this.color + " btn-sm");
    button.setAttribute("data-original-title", "");
    button.setAttribute("title", "");
    var i = document.createElement("i");
    i.className = this.iconName;

    button.append(i);
    var nameSpan = document.createElement("span");
    if (this.name == undefined) {
        this.name = "";
    } else {
        nameSpan.setAttribute("style", "padding: 0 10px;");
    }
    nameSpan.innerHTML = this.name;
    button.append(nameSpan);
    var div = document.createElement("div");
    div.className = "ripple-container";
    button.append(div);
    button.style = "margin-left: 10px;";
    if (onClickFunction != null) {
        try {
            button.id = this.fnParams.dtdata.id;
        } catch (e) {
            console.log("dont hav id in fnParams");
        }
        button.onclick = function() {
            fnParams.index = parseInt($($(button).closest("tr")).attr("aria-index"));
            fnParams.row = $(button).closest("tr");
            fnParams.tbody = $(button).closest("tbody");
            onClickFunction(fnParams);
        };
    }
    return button;
}

function toggleView(id) {
    var dataSource =
        window.phoenixModels.filter((v, i) => {
            return v.tableSelector == id
        })[0]
    $(dataSource.tableSelector).closest(".table-responsive").find(".grid_view").toggleClass("d-none")
    $(dataSource.tableSelector).closest(".table-responsive").find(".list_view").toggleClass("d-none")



}

function form_new(id) {
    var dataSource =
        window.phoenixModels.filter((v, i) => {
            return v.tableSelector == id
        })[0]

    var form =
        `
          <form style="" class="with_mod" id="` +
        dataSource.link +
        `"  module="` +
        dataSource.moduleName +
        `">
          </form>`;
    $("#myModal")
        .find(".modal-title")
        .html("Create  New " + dataSource.moduleName);
    $("#myModal").find(".modal-body").html(form);
    createForm({
        id: 0
    }, dataSource.table, dataSource.customCols);
    $("#myModal").modal('show');

}

function formNavClick(index) {
    $(".form_nav .nav-link").removeClass("active")
    $(".nav-link[aria-index='" + index + "']").toggleClass("active")
    $(".fp").addClass("d-none")
    $("#panel_" + index).toggleClass("d-none")
}

function toggleSubContent(html_content, row) {
    var dom = $("#subcontent")[0]
    console.log(html_content)
    if (dom.offsetParent == null && html_content != null) {
        $("#content").toggle()
        $("#subcontent").toggle()
        $("#subcontent").html(html_content)
    } else {
        // where sub dt is visible and content is not null
        if (dom.offsetParent != null && html_content != null) {
            row.child(html_content).show();
        } else {
            $("#content").show()
            $("#subcontent").html('')
            $("#subcontent").hide()

            try {

                window.currentAssoc.table.draw()
            } catch (e) {

            }


        }

    }

}

function showAssocDataManyToMany(params) {
    var dt = params.dataSource;
    var table = $(dt.tableSelector).DataTable();
    var r = table.row(params.row);
    var preferedSelector = "subTable";
    if (params["hyperSelector"] != null) {
        preferedSelector = params["hyperSelector"];
    }

    function call() {
        var jj =
            `
        <table class="table" id="` +
            preferedSelector +
            `" style="width:100%">
          <thead>
          </thead>
          <tbody>
          </tbody>
        </table>

            `;
        r.child(jj).show();
        var map = {};
        var primary_key;
        $(params.extraParams).each((i, xparam) => {
            primary_key = table.data()[params.index][xparam["parent"]];
            if (xparam["value"] != null) {
                map[xparam["child"]] = xparam["value"];
            } else {
                map[xparam["child"]] = table.data()[params.index][xparam["parent"]];
            }
        });
        // params.subSource.data = map;
        // params.subSource.table = populateTable(params.subSource);


        var subSource = new phoenixModel({
            moduleName: params.subSource,
            link: params.subSource,
            customCols: [],
            columns: params.columns

        })
        subSource.allData = []
        subSource.tableSelector = "#" + preferedSelector
        console.log(map)
        console.log(params.subSource)
        subSource.data = map;
        var label_keys =
            Object.keys(subSource.data)
        label_keys.forEach((v, i) => {

            subSource.customCols.push({
                label: v,
                hidden: true,
                data: subSource.data[v]
            })
        })
        subSource.data.preloads = params.preloads
        subSource.table = populateTable(subSource);

    }
    if (r.child.isShown()) {
        if (gParent == this) {
            r.child.hide();
        } else {
            gParent = this;
            call();
        }
    } else {
        table.rows().every(function(rowIdx, tableLoop, rowLoop) {
            this.child.hide();
        });
        gParent = this;
        call();
    }
}

function showAssocData(params) {
    function callFn(params) {
        var preferedSelector = "subTable";
        if (params["hyperSelector"] != null) {
            preferedSelector = params["hyperSelector"];
        }
        var title = params.title;
        if (title == null) {
            title = "Subtable";
        }

        var dt = params.dataSource;
        var table = $(dt.tableSelector).DataTable();
        var r = table.row(params.row);
        var jj =
            `<div class="subcontainer" >
        <div class="d-flex justify-content-between items-align-center">
        <p class="pl-4 lead" style="border-left: solid 4px var(--primary);">` +

            title +
            `</p>
        <div>
          <div class="btn btn-sm btn-primary" onclick="toggleSubContent()">Back</div>
        </div>
      </div>

        <table class="table" id="` +
            preferedSelector +
            `" style="width:100%">
          <thead>
          </thead>
          <tbody>
          </tbody>
          <tfoot>
          </tfoot>
        </table>
        </div>

      `;
        toggleSubContent(jj, r);
        // r.child(jj).show()
        var map = {};
        var primary_key;
        $(params.extraParams).each((i, xparam) => {
            primary_key = table.data()[params.index][xparam["parent"]];
            if (xparam["value"] != null) {
                map[xparam["child"]] = xparam["value"];
            } else {
                map[xparam["child"]] = table.data()[params.index][xparam["parent"]];
            }
        });
        if (params.footerFn != null) {
            map["footerFn"] = params.footerFn;
        }
        window.currentAssoc = window.phoenixModels.filter((v, i) => {
            return v.moduleName == params.subSource
        })[0]
        var subSource = new phoenixModel(window.currentAssoc)
        subSource.allData = []
        subSource.tableSelector = "#" + preferedSelector
        console.log(map)
        console.log(params.subSource)
        subSource.data = map;
        var label_keys =
            Object.keys(subSource.data)
        label_keys.forEach((v, i) => {

            subSource.customCols.push({
                label: v,
                hidden: true,
                data: subSource.data[v]
            })
        })
        subSource.table = populateTable(subSource);
        if (params.customSorts != null) {
            subSource.table.order(params.customSorts).draw();
        }
        if (params.onDrawFunction != null) {
            subSource.table.on("draw", function() {
                params.onDrawFunction(primary_key);
            });
        } else {

        }
        appendDtButtons("#" + preferedSelector, "#subcontent")
    }
    openSubData(params, callFn)
}


function openSubData(params, callFn) {
    var title = params.title;
    if (title == null) {
        title = "Subtable";
    }
    var dt = params.dataSource;
    var table = $(dt.tableSelector).DataTable();
    var r = table.row(params.row);
    dt.currentData = table.data()[params.index];

    function call() {
        callFn(params)
    }
    if (r.child.isShown()) {
        if (title == window.prev_title) {
            r.child.hide();
        } else {
            setTimeout(function() {
                call();
            }, 100)
        }
        window.prev_title = title;
    } else {
        table.rows().every(function(rowIdx, tableLoop, rowLoop) {
            this.child.hide();
        });
        setTimeout(function() {
            call();
        }, 100)
    }
}

function editData(params) {
    console.log("editing data...")
    var dt = params.dataSource;
    var table = $(dt.tableSelector).DataTable();
    var r = table.row(params.row);

    var preferedLink;
    if (params.link != null) {
        preferedLink = params.link;
    } else {
        preferedLink = dt.link;
    }

    function call() {
        var jj =
            `<form style="margin-top: 0px;" class="with_mod" id="` +
            preferedLink +
            `"  module="` +
            dt.moduleName +
            `"></form>`;
        // r.child(jj).show();

        $("#myModal")
            .find(".modal-title")
            .html("Edit " + dt.moduleName);
        $("#myModal").find(".modal-body").html(jj);
        $("#myModal").modal('show');
        console.log(dt)
        console.log(table.data())
        var rowData = table.data()[params.index]
        console.log(rowData)
        createForm(rowData, table, params.customCols, params.postFn);
        if (params.drawFn != null) {
            params.drawFn()
        }
    }

    if (r.child.isShown()) {
        r.child.hide();
        call();
    } else {
        table.rows().every(function(rowIdx, tableLoop, rowLoop) {
            this.child.hide();
        });
        gParent = this;
        call();
    }
}

function deleteAssoc(params) {
    var dataSource = params.dataSource;

    var data = params["data"];
    if (dataSource != null) {
        var curData = dataSource.table.data()[params.index];
        if (params.targets != null) {
            $(params.targets).each((i, target) => {
                if (target.prefix != null) {
                    data[target.child] = target.prefix + curData[target.parent];
                } else {
                    data[target.child] = curData[target.parent];
                }
            });
        }
    }

    console.log(data);

    $.ajax({
        url: "/api/webhook",
        method: "DELETE",
        data: {
            scope: "assoc_data",
            id: curData.id,
            parent: data.parent
        }
    }).done(function() {
        App.notify("deleted!", {
            type: "info"
        });
        dataSource.table.draw(false);
    });
}

function deleteData(params) {
    var dataSource = params["dataSource"];
    var table = $(dataSource.tableSelector).DataTable();
    var dtdata = table.data()[params.index];
    $("#myModal").find(".modal-title").html("Confirm delete this data?");
    var confirm_button = formButton("fa fa-check", "outline-danger");
    console.log(dataSource);
    confirm_button.onclick = function() {
        $.ajax({
            url: "/api/" + dataSource.link + "/" + dtdata.id,
            dataType: "json",
            headers: {
                "Authorization": "Basic " + window.userToken
            },
            method: "DELETE",
            data: dataSource.data
        }).done(function(j) {
            $("#myModal").modal("hide");

            App.notify("Deleted!", {
                type: "info"
            });
            dataSource.table.draw(false);
        }).fail(function(e) {
            console.log(e.responseJSON.status);


            App.notify("Not Added! reason: " + e.responseJSON.status, {
                type: "warning"
            });


        });;
    };
    var center = document.createElement("center");
    center.append(confirm_button);
    $("#myModal").find(".modal-body").html(center);
    $("#myModal").modal();
}


function repopulateFormInput(data, formSelector) {
    var inputs = $(formSelector).find("[name]");
    $(inputs).each(function(i, v) {
        var name = $(v).attr("aria-label");
        var hidden_value = $(v).attr("aria-value");

        if ($(v).prop("localName") == "select") {
            // $(v).selectpicker("val", data[name]);
            $(v).val(data[name]);
        } else if (hidden_value != null) {
            $(v).val(hidden_value);
        } else if ($(v).hasClass("code")) {
            try {
                //  var ht = data[name]
                // $(v).val(html_beautify(ht));

                $(v).val(data[name]);
                var hid_inpt = document.createElement("input");
                hid_inpt.setAttribute("type", "hidden");
                hid_inpt.setAttribute("name", $(v).attr("name"));
                $(v).after(hid_inpt);
                var editor = ace.edit($("textarea")[0], {
                    mode: "ace/mode/html",
                    selectionStyle: "text"
                });
                editor.resize();
                window.editor = editor;
                editor.session.setUseWrapMode(true);
                editor.session.on("change", function(delta) {
                    // delta.start, delta.end, delta.lines, delta.action

                    $(hid_inpt).val(window.editor.getValue());
                });
            } catch (e) {
                $(v).val(data[name]);
            }
        } else {
            if ($(v).attr("type") == "checkbox") {
                $(v).prop("checked", data[name]);
            } else {
                if (data != null) {
                    console.log(name);
                    console.log("name: " + name + ", data: " + data[name]);
                    $(v).val(data[name]);
                } else {
                    console.log("name: " + name + ", data: ?");
                }
            }
        }
    });
}

function generateInputs(j, v, object, qv) {
    var input2 = "";
    var label_title = v.charAt(0).toUpperCase() + v.slice(1)

    if (typeof qv == "object") {
        if (qv.alt_name != null) {
            label_title = qv.alt_name
        }

    }


    switch (j[v]) {
        case "string":
            // code block

            input2 = `<div class="">
                      <div class="pb-1 pt-1 ps-1 text-left">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`
            break;
        case "boolean":
            // code block

            input2 = `<div class="row">
                      <label class="offset-1 col-sm-3 col-form-label text-right label-checkbox">` + label_title + `</label>
                      <div class="col-sm-6 checkbox-radios">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input class="form-check-input" type="checkbox" aria-label="` + v + `" name="` + object + `[` + v + `]" value=""> This ` + v + `
                            <span class="form-check-sign">
                              <span class="check"></span>
                            </span>
                          </label>
                        </div>
                        
                      </div>
                    </div>`
            break;
        case "integer":
            // code block
            if (v.includes("id")) {
                input2 =
                    '<input  aria-label="' +
                    v +
                    '" name="' +
                    object +
                    "[" +
                    v +
                    ']" type="hidden" class="form-control" value="0">';
            } else {

                input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="number" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`
            }
            break;
        case "date":

            input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control datepicker">
                        </div>
                      </div>
                    </div>`
            break;
        case "naive_datetime":

            input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control datetimepicker">
                        </div>
                      </div>
                    </div>`
            break;
        default:
            // code block
            if (v == "id" || v.includes("_id")) {
                input2 =
                    '<input  aria-label="' +
                    v +
                    '" name="' +
                    object +
                    "[" +
                    v +
                    ']" type="hidden" class="form-control" value="0">';
            } else {

                input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`
            }
    }
    if (typeof qv == "object") {
        var selections = [];

        if (qv.selection != null) {
            var live_search = ""
            var multiple = ""
            if (qv.live_search != null) {
                if (qv.live_search) {
                    live_search = `data-live-search="true"`
                }
            }
            if (qv.multiple != null) {
                if (qv.multiple) {
                    multiple = "multiple"
                }
            }
            $(qv.selection).each(function(index, selection) {
                var name;

                var vall;
                if (typeof selection == "object") {
                    name = selection.name;
                    vall = selection.id;
                } else {
                    name = selection;
                    vall = selection;
                }
                selections.push('<option value="' + vall + '">' + name + "</option>");
            });



            input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group">
                         <select ` + multiple + ` ` + live_search + `aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control selectpicker" >
                         ` + selections.join("") + `
                         </select>
                        </div>
                      </div>
                    </div>`
        }


        if (qv.binary) {


            input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <textarea rows=4 cols=12 aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control"></textarea>
                        </div>
                      </div>
                    </div>`
        }
        if (qv.code) {

            input2 = `<div class="row">
                      <label class="col-sm-3 col-form-label text-right">` + label_title + `</label>
                      <div class="col-sm-9">
                        <div class="form-group bmd-form-group">
                          <textarea rows=4 cols=12 aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control code"></textarea>
                        </div>
                      </div>
                    </div>`
        }
        if (qv.checkboxes != null) {
            var checkboxes = [];

            qv.checkboxes.sort(function(b, a) {
                return b.name.localeCompare(a.name);
            })

            $(qv.checkboxes).each((i, checkbox) => {
                var c =
                    `
                    <div class="form-check">
                      <label class="text-capitalize">
                        <input class="form-check-input" type="checkbox" name="` +
                    object +
                    "[" +
                    v +
                    `][` +
                    checkbox.id +
                    `]"  value="true"> ` +
                    checkbox.name +
                    `
                        <span class="form-check-sign">
                          <span class="check"></span>
                        </span>
                      </label>
                    </div>`;
                checkboxes.push(c);
            });

            input2 = `<div class="row">
                      <label class="col-sm-2 col-form-label text-right">` + label_title + `</label>
                      <div class="col-sm-8">
                        <div class="form-group bmd-form-group">
                          ` + checkboxes.join("") + `
                        </div>
                      </div>
                    </div>`
        }
        if (qv.upload) {


            input2 = `<div class="">
                      <div class="pb-1 pt-1 ps-1 text-left">` + label_title + `</div>
                      <div class="col-sm-12">
                        
                        <img style="display: none;" id="myImg" src="#" alt="your image" width=300>
                          <input style="padding-top: 2vh;" type="file" aria-label="` + v + `" name="` + object + `[` + v + `]" class="">
                        
                      </div>
                    </div>`
        }
        if (qv.editor) {
            input2 =
                '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
                label_title +
                '</label><textarea id="editor1" rows=10 cols=12 aria-label="' +
                v +
                '" name="' +
                object +
                "[" +
                v +
                ']" class="form-control" ></textarea></div></div>';

            // var editor = new EditorJS('editorjs');
        }
        if (qv.date) {

            input2 = `<div class="row">
                      <label class="offset-1 col-sm-3 col-form-label text-right">` + label_title + `</label>
                      <div class="col-sm-6">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control datepicker">
                        </div>
                      </div>
                    </div>`
        }
        if (qv.alias) {

            input2 = `<div class="">
                      <div class="pb-1 pt-1 ps-1 text-left">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`


        }
        if (qv.hidden) {
            input2 =
                '<input type="hidden" aria-label="' +
                v +
                '" name="' +
                object +
                "[" +
                v +
                ']"  aria-value="' + qv.data + '">';
        }

    }

    return input2;
}

function appendInputs(xv, cols, j, object) {
    $(cols).each(function(qi, qv) {
        var v;
        if (typeof qv == "object") {
            v = qv.label;
        } else {
            v = qv;
        }
        var input = "";
        var input2 = "";
        input2 = generateInputs(j, v, object, qv);
        if (typeof qv == "object") {
            var selections = [];
            if (qv.binary) {} else {
                if (qv.sub != null) {
                    // here insert a smaller form inputs?
                    // run the form submission first,
                    // get the primary id and stuff it back to parent form
                    var subModule = qv.sub.moduleName;
                    var subLink = qv.sub.link;
                    var customCols = qv.sub.customCols;
                    $.ajax({
                        url: "/api/webhook?scope=gen_inputs",
                        dataType: "json",
                        async: false,
                        data: {
                            module: subModule
                        }
                    }).done(function(j) {
                        var cols = Object.keys(j);

                        if (customCols != null) {
                            if (customCols.length > 0) {

                                cols = customCols;
                            }
                        }
                        console.log(cols)
                        var combo = [];
                        $(cols).each((i, col) => {
                            var v;
                            if (typeof col == "object") {
                                v = col.label;
                            } else {
                                v = col;
                            }
                            var input3 = "";
                            input3 = generateInputs(j, v, subLink, col);
                            combo.push(input3);
                        });

                        input2 =
                            input2 +
                            `<div class="row subform" style="display: none;"><div class="offset-1 col-sm-9">` +
                            combo.join("") +
                            `</div></div>`;
                    });
                }
            }
        }

        // input into a different panels?
        $(xv).append(input2);
    });

}

function createForm(dtdata, table, customCols, postFn) {
    $(".with_mod").each(function(i, xv) {
        // var xv = form ;
        $(xv).html("");

        var mod = $(this).attr("module");
        var object = $(this).attr("id");

        $.ajax({
            async: false,
            url: "/api/webhook?scope=gen_inputs",
            dataType: "json",
            data: {
                module: mod
            }
        }).done(function(j) {
            var cols = Object.keys(j);


            if (customCols != null) {
                // convert this to a ... tab panels...

                if (typeof customCols[0] === 'object' && customCols[0] !== null) {
                    console.log("has multi list," + customCols.length)
                        // insert the tabs? 

                    $(xv).html(`
                            <div class="row">
                              <div class="col-sm-4">
                                <ul class="nav nav-pills flex-column form_nav">
                                 
                               
                                </ul>

                              </div>
                              <div class="col-sm-8 p-lg-1 p-4" id="form_panels">

                              </div>
                            </div>

                        `)



                    $(customCols).each((i, v) => {
                        if (i == 0) {
                            $(".form_nav").append(`
                                   <li class="nav-item">
                                      <a class="active nav-link" aria-index="` + i + `" href="#" onclick="formNavClick('` + i + `')" >` + v.name + `</a>
                                    </li>
                          `)
                        } else {

                            $(".form_nav").append(`
                                   <li class="nav-item">
                                      <a class="nav-link" aria-index="` + i + `" href="#" onclick="formNavClick('` + i + `')" >` + v.name + `</a>
                                    </li>
                          `)
                        }
                        // insert the panels
                        if (i == 0) {
                            $("#form_panels").append(`<div class="fp " id="panel_` + i + `"></div>`)

                        } else {
                            $("#form_panels").append(`<div class="fp d-none"  id="panel_` + i + `"></div>`)

                        }
                        $("#panel_" + i).append(`<div class="col-lg-12"><b class="pb-4">` + v.name + `</b></div>`);
                        appendInputs($("#panel_" + i), v.list, j, object)
                    })



                } else {
                    cols = customCols;
                    appendInputs(xv, cols, j, object)
                    console.log(cols.join("','"));
                }


            } else {
                appendInputs(xv, cols, j, object)
                console.log(cols.join("','"));
            }

            $($(xv).find("select")).on("change", function() {
                var val = $(this).val();
                var sf = $($(this).closest(".subform")).length;
                console.log(val);
                if (sf == 0) {

                    if (val == 0) {
                        $(".subform").fadeIn();
                    } else {
                        $(".subform").hide();
                    }
                }
            });
            // $(".selectpicker").selectpicker();
            // $(".datetimepicker").datetimepicker({
            //     format: "YYYY-MM-DD HH:mm:ss",
            //     icons: {
            //         time: "fa fa-clock-o",
            //         date: "fa fa-calendar",
            //         up: "fa fa-chevron-up",
            //         down: "fa fa-chevron-down",
            //         previous: "fa fa-chevron-left",
            //         next: "fa fa-chevron-right",
            //         today: "fa fa-screenshot",
            //         clear: "fa fa-trash",
            //         close: "fa fa-remove"
            //     }
            // });
            // $(".datepicker").datetimepicker({
            //     format: "YYYY-MM-DD",
            //     icons: {
            //         time: "fa fa-clock-o",
            //         date: "fa fa-calendar",
            //         up: "fa fa-chevron-up",
            //         down: "fa fa-chevron-down",
            //         previous: "fa fa-chevron-left",
            //         next: "fa fa-chevron-right",
            //         today: "fa fa-screenshot",
            //         clear: "fa fa-trash",
            //         close: "fa fa-remove"
            //     }
            // });
            // $("select.selectpicker").selectpicker()


            function btnSubm() {
                var formData = new FormData($(xv).closest("form")[0]);
                $(xv)
                    .find("input[type='checkbox']")
                    .each((zi, zv) => {
                        $(zv).val($(zv).prop("checked"));

                        formData.append(
                            object + "[" + $(zv).attr("aria-label") + "]",
                            $(zv).prop("checked")
                        );
                    });

                $(xv)
                    .find("textarea")
                    .each((zi, zv) => {
                        formData.append(
                            object + "[" + $(zv).attr("aria-label") + "]",
                            $(zv).val()
                        );
                    });
                // console.log(formData);
                var failed_inputs =
                    $(".with_mod").closest("form").find("input").filter((i, v) => {
                        return v.checkValidity() == false
                    })
                console.log(failed_inputs);
                if (failed_inputs.length > 0) {

                    failed_inputs.map((v, i) => {


                        App.notify("This input: " + $(i).attr("placeholder") + " is not valid!", {
                            type: "danger"
                        });

                    })

                } else {

                    $.ajax({
                            url: "/api/" + object,
                            dataType: "json",
                            headers: {
                                "Authorization": "Basic " + window.userToken
                            },
                            method: "POST",
                            enctype: "multipart/form-data",
                            processData: false, // tell jQuery not to process the data
                            contentType: false,
                            data: formData
                        })
                        .done(function(j) {
                            App.notify("Added!", {
                                type: "success"
                            });
                            if (table != null) {
                                console.log("redrawing table.. ");
                                console.log(object)
                                var tarMod = window.phoenixModels.filter((v, i) => {
                                    return v.moduleName == object
                                })[0]
                                tarMod.table.draw();
                                // console.log(table);
                                // table.draw(false);
                                toggleSubContent();

                                // try {
                                //     if ($("#subSubTable").length > 0) {
                                //         var subTable = $("#subSubTable").DataTable();
                                //         subTable.draw(false);
                                //     } else {
                                //         var subTable = $("#subTable").DataTable();
                                //         subTable.draw(false);
                                //     }
                                // } catch (e) {}
                            }
                            if (postFn != null) {
                                if (dtdata.xparams != null) {

                                    postFn(dtdata.xparams);
                                } else {

                                    postFn(j);
                                }
                            }

                            $("#myModal").modal("hide");
                        })
                        .fail(function(e) {
                            console.log(e.responseJSON.status);
                            App.notify("Not Added! reason: " + e.responseJSON.status, {
                                type: "danger"
                            });
                        });
                }

            };
            var row = document.createElement("div")
            row.className = "row"

            var col_lg_12 = document.createElement("div")
            col_lg_12.className = "pt-4 col-lg-12"
            row.append(col_lg_12)

            try {
                CKEDITOR.replace("editor1", {
                    height: 500
                });
                CKEDITOR.config.allowedContent = true;
                CKEDITOR.instances.editor1.on("change", function() {
                    var data = CKEDITOR.instances.editor1.getData();
                    $(CKEDITOR.instances.editor1.element["$"]).val(data);
                });
            } catch (e) {
                console.log("no editor");
            }

            var submit_btn = formButton(

                {
                    iconName: "check",
                    color: "primary subm",
                    name: "Submit"

                }, {},
                btnSubm

            );
            col_lg_12.append(submit_btn)

            if ($(xv).find(".subm").length == 0) {
                $(xv).append(row);
            }

            repopulateFormInput(dtdata, xv);
        });
        // return xv;
    });
}

function submitFormData(selector, url) {

    var object = url
    var xv = $(selector)[0]
    var formData = new FormData(xv);

    $(xv)
        .find("input[type='checkbox']")
        .each((zi, zv) => {
            $(zv).val($(zv).prop("checked"));

            formData.append(
                object + "[" + $(zv).attr("aria-label") + "]",
                $(zv).prop("checked")
            );
        });
    console.log(formData);
    $.ajax({
            url: "/api/" + object,
            dataType: "json",
            method: "POST",
            headers: {
                "Authorization": "Basic " + window.userToken
            },
            enctype: "multipart/form-data",
            processData: false, // tell jQuery not to process the data
            contentType: false,
            data: formData,
            xhr: function() {
                $("#helper").fadeIn();
                //Get XmlHttpRequest object
                var xhr = $.ajaxSettings.xhr();
                //Set onprogress event handler
                xhr.upload.onprogress = function(data) {
                    var perc = Math.round((data.loaded / data.total) * 100);
                    $("#helper").text(perc + "%");
                };
                return xhr;
            },
            error: function(e) {
                console.error("Error has occurred while uploading the media file.");

            }
        })
        .done(function(j) {
            App.notify("Added!", {
                type: "success"
            });

            try {
                window.reinit();
                manualEntry();
            } catch (e) {

            }

            // $("#mySpinner").modal("hide");
        })
        .fail(function(e) {
            console.log(e.responseJSON.status);
            App.notify("Not Added! reason: " + e.responseJSON.status, {
                type: "danger"
            });
        });
};


function calWidth(done, total) {
    var perc = (done / total * 100).toFixed(0)
    return 'width: ' + perc + '%;'
}

function growthComparison(cur, prev) {
    var diff = (((cur - prev) / prev) * 100).toFixed(2)
    var df = (cur - prev)
    if (cur < prev) {

        var text = `<span class="d-flex justify-content-start align-items-center" 
 style="color: red"><i class="pe-2 fa fa-2x fa-caret-down"></i>` + df + ` <small class="ps-2">` + diff + `%</small></span>`
    } else {

        var text = `<span class="d-flex justify-content-start align-items-center" 
 style="color: var(--bs-success)"><i class="pe-2 fa fa-2x fa-caret-up"></i>` + df + ` <small class="ps-2">` + diff + `%</small></span>`
    }
    return text

}

function avatarCard(name, subtitle, img_url) {

    return `
                    <div class="d-flex justify-content-start align-items-center">
                      <img height="32px" width="32px" class="rounded-circle" src="` + img_url + `" alt="Circle image">
                      <div class="d-flex flex-column  ps-3">
                        <span class="text-secondary">` + name + `</span><div>` + subtitle + `</div>
                      </div>
                    </div>
                    `
}



let Dashboard = {

    Widget: {
        tableProgress(dom, options) {
            var default_options = {
                title: 'Upcoming fulfillments<br> <small>This month for Damien</small>',
                icon_map: "fa fa-wallet fa-2x",
                style: "basic",
                color: 'bg-success',
                headers: [],
                dt: [{
                    title: 'Cendol4u Pte Ltd',
                    done: 3,
                    total: 20
                }, {
                    title: 'XY2C Trading',
                    done: 5,
                    total: 20
                }, {
                    title: 'FG5C Trading',
                    done: 8,
                    total: 20
                }, {
                    title: 'Thunder Vanilla Sdn Bhd',
                    done: 11,
                    total: 20
                }, {
                    title: 'ED3C Trading',
                    done: 12,
                    total: 20
                }, {
                    title: 'AB2C Trading',
                    done: 18,
                    total: 20
                }]
            }
            var keys =
                Object.keys(default_options)

            keys.forEach((v, i) => {
                this[v] = default_options[v]
            })
            keys.forEach((v, i) => {
                if (options[v] != null) {
                    this[v] = options[v]
                }
            })
            var inner_html

            if (this.style == "status") {
                inner_html = `
                    <div x-bind:class="color" class="card-header text-white">
                      <div x-html="title"></div>
                      <i style="position: absolute;right: 2vw;top: 2vh;opacity: 0.3;" x-bind:class="icon_map" class=""></i>
                    </div>
                    <div class="card-body">

                      <table class="table">
                          <tr>
                        <template x-for="head in headers">
                            <th>
                                <div x-html="head"></div>
                            </th>
                            
                        </template>                   
                          </tr>
                        <template x-for="row in rows">
                          <tr style="vertical-align: top;">
                            <td>
                                <div x-html="row.first"></div>
                            </td>
                            <td>
                                <div x-html="row.second"></div>
                            </td>
                            <td>
                                <div x-html="row.third"></div>
                            </td>
                          </tr>
                        </template>
                      </table>
                    </div>

              `
            }
            if (this.style == "basic") {
                inner_html = `
                    <div x-bind:class="color" class="card-header text-white">
                      <div x-html="title"></div>
                      <i style="position: absolute;right: 2vw;top: 2vh;opacity: 0.3;" x-bind:class="icon_map" class=""></i>
                    </div>
                    <div class="card-body">

                      <table class="table">
                        <tr>
                          <th>Company</th>
                          <th class="text-right">Fulfilled</th>
                          <th class="text-center">Actions</th>
                        </tr>
                        <template x-for="row in rows">
                          <tr >
                            <td>
                              <div>
                                <div x-text="row.title"></div>
                                <div class="progress" style="height: 4px;">
                                  <div class="progress-bar" x-bind:class="calColor(row.done, row.total)" role="progressbar" x-bind:style="calWidth(row.done, row.total)" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div class="d-flex justify-content-end align-items-end">
                                <div x-text="row.done"></div>
                                <small class="ps-2 text-secondary "> /<span x-text="row.total"></span></small>
                              </div>
                            </td>
                            <td class="text-center">
                              <div class="btn btn-sm btn-outline-primary"><i class="fa fa-search"></i></div>
                            </td>
                          </tr>
                        </template>
                      </table>
                    </div>

              `
            }
            var html
            var html = `
                  <div class="card" x-data='{
                    icon_map: "` + this.icon_map + `",
                    title: "` + this.title + `",
                    color: "` + this.color + `", headers: ` + JSON.stringify(this.headers) + `,
                    
                    rows: ` + JSON.stringify(this.dt) + `
                    
                    }'>
                    ` + inner_html + `
                  </div>
                  `
            console.log(html)
            $(dom).html(html)
                // $(postFns).each((i, v) => {
                //     setTimeout(() => {
                //         v();
                //     }, 100)

            // })
        },
        progressBar(dom, options) {
            var style, target_name, done, total, postFns, prefix, suffix, icon_map, icon_size, color;

            var default_options = {
                target_name: "This month fulfillments",
                done: 5,
                total: 20,
                postFns: [],
                prefix: null,
                suffix: "more to go",
                icon_map: "fa fa-users fa-2x",
                icon_size: null,
                color: null,
                style: "basic"
            }
            default_options.pending = default_options.total - default_options.done
            options.pending = options.total - options.done

            var keys =
                Object.keys(default_options)

            keys.forEach((v, i) => {
                this[v] = default_options[v]
            })
            keys.forEach((v, i) => {
                if (options[v] != null) {
                    this[v] = options[v]
                }
            })

            this.icon_map = this.icon_map == null ? "" : this.icon_map
            this.prefix = this.prefix == null ? "" : this.prefix
            this.suffix = this.suffix == null ? "more to go" : this.suffix

            if (this.color == null) {
                var s = (this.done / this.total) * 100
                if (s == 100) {
                    this.color = "bg-primary"
                }
                if (s < 100) {
                    this.color = "bg-success"
                }
                if (s < 80) {
                    this.color = "bg-warning"
                }
                if (s < 25) {
                    this.color = "bg-danger"
                }

            }

            var inner_content;

            if (this.style == "basic") {
                inner_content = `
              <div class="card-body">
                <div class="d-flex justify-content-start align-items-center pb-2  " >
                  <div class="text-xl pe-2 d-flex justify-content-start align-items-center" >
                      <small x-text="prefix"></small>
                      <div class="ps-1" x-text="pending"></div>
                  </div>
                  <div x-text="suffix">more to go</div>
                  
                </div>
                <div class="progress">
                  <div class="progress-bar bg-primary"  role="progressbar" 
                  x-bind:style="width" aria-valuemin="0" aria-valuemax="100"></div>
                  <div class="progress-bar " x-bind:class="color"  role="progressbar" 
                  x-bind:style="rem_width" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="pt-2 d-flex justify-content-start text-secondary"><div x-text="target_name"></div> 
                  <div class=" d-flex justify-content-start ps-2">
                    <div x-text="done"></div>/<div x-text="total"></div>
                  </div>
                </div>

                <i x-bind:class="icon" style="position: absolute;right: 1vw;color: #0001;top: 1vh;"></i>
              </div>

              `
            }

            if (this.style == "inverse") {
                inner_content = `
            <div class="card-body">
              <div class="pt-2 d-flex justify-content-start "><div x-text="target_name"></div> 
              </div>
              <div class="d-flex justify-content-start align-items-end pb-2  " >
                <div class="text-xl pe-2 d-flex justify-content-start align-items-center" >
                    <small x-text="prefix"></small>
                    <div class="ps-1" x-text="done"></div>
                </div>
                     <div class="d-flex justify-content-end pb-2 text-secondary">
                      /<div x-text="total"></div>
                    </div>
              </div>
              <div class="progress"  style="height: 4px;">
                <div class="progress-bar" x-bind:class="color" role="progressbar" 
                x-bind:style="width" aria-valuemin="0" aria-valuemax="100"></div>
              
              </div>
              <div class="pt-2 d-flex justify-content-end text-secondary">
               
              </div>

              <i x-bind:class="icon" style="position: absolute;right: 1vw;color: #0001;top: 1vh;"></i>
            </div>

              `
            }
            if (this.style == "thin") {
                inner_content = `
            <div class="card-body">
              <div class="d-flex justify-content-start align-items-center pb-2  " >
                <div class="text-xl pe-2 d-flex justify-content-start align-items-center" >
                    <small x-text="prefix"></small>
                    <div class="ps-1" x-text="pending"></div>
                </div>
                <div x-text="suffix">more to go</div>
                
              </div>
              <div class="progress"  style="height: 4px;">
                <div class="progress-bar" x-bind:class="color" role="progressbar" 
                x-bind:style="width" aria-valuemin="0" aria-valuemax="100"></div>
              
              </div>
              <div class="pt-2 d-flex justify-content-start text-secondary"><div x-text="target_name"></div> 
                <div class=" d-flex justify-content-start ps-2">
                  <div x-text="done"></div>/<div x-text="total"></div>
                </div>
              </div>

              <i x-bind:class="icon" style="position: absolute;right: 1vw;color: #0001;top: 1vh;"></i>
            </div>
              `
            }


            var html =
                `
            <div class="card" x-data="
              { 
                icon: '` + this.icon_map + `',
                prefix: '` + this.prefix + `',
                suffix: '` + this.suffix + `',
                target_name: '` + this.target_name + `',
                color: '` + this.color + `',
                done: ` + this.done + `, 
                total: ` + this.total + `, 
                pending: ` + this.pending + `,
                rem_width: 'width:' + ((` + this.pending + `/` + this.total + `)*100).toFixed(0) + '%',
                width: 'width:' + ((` + this.done + `/` + this.total + `)*100).toFixed(0) + '%'
              }">
            ` + inner_content + `
            </div>
            `
            $(dom).html(html)
            $(postFns).each((i, v) => {
                setTimeout(() => {
                    v();
                }, 100)

            })

        },
        sales(dom, options) {
            var style, title, decimal, cur, prev, postFns, prefix, suffix, icon_map;

            var default_options = {
                title: 'Total Sales <small>(MYR)</small>',
                cur: 200,
                decimal: false,
                prev: 100,
                postFns: [],
                prefix: "",
                suffix: "",
                icon_map: "fa fa-wallet fa-2x",
                style: "basic"
            }
            default_options.diff = (((default_options.cur - default_options.prev) / default_options.prev) * 100).toFixed(2)
            options.diff = (((options.cur - options.prev) / options.prev) * 100).toFixed(2)
            var keys =
                Object.keys(default_options)

            keys.forEach((v, i) => {
                this[v] = default_options[v]
            })
            keys.forEach((v, i) => {
                if (options[v] != null) {
                    this[v] = options[v]
                }
            })
            var inner_html

            if (this.style == "basic") {
                inner_html = `
                <div class="card-body">
                  <div class="text-center text-secondary" x-html="title"></div>
                  <div class="row">
                    <div class="col-sm-12 text-center d-flex align-items-center justify-content-around">
                      <div class="text-xl float" x-html="cur">0</div>

                    </div>
                    <div class="col-sm-10 offset-1 text-center pt-2 ">
                       
                     <div class="d-flex justify-content-around align-items-center text-secondary">
                        <i x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' "
                            x-bind:class="cur_month < last_month ? 'fa fa-2x fa-caret-down' : 'fa fa-2x fa-caret-up' "></i>
                    
                        <div class="text-sm d-flex justify-content-around"  x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' ">
                          <div class="format_float pe-2" x-text="cur_month - last_month" ></div>
                          (<span x-text="diff">0</span>%)
                        </div>
                        <small class="ps-2">prev month</small>
                     </div>

                    </div>
                  </div>
                  </div>
              `
            }
            if (this.style == "Compact") {
                inner_html = `
              <div class="card-body">
                  <div class="row" ">
                    <div class="col-sm-12 text-left">
                      <div class="text-secondary" x-html="title"></div>
                    </div>
                    <div class="col-sm-12 text-left d-flex align-items-center justify-content-start">
                      <div class="text-xl format_float" x-html="cur">0</div>
                    </div>
                    <div class="col-sm-10 text-center ">
                     <div class="d-flex justify-content-around align-items-center" >
                      <i x-bind:style=" cur_month < last_month ? 'color: red; ' : 'color: var(--bs-success); ' "
                            x-bind:class="cur_month < last_month ? 'fa fa-2x fa-caret-down' : 'fa fa-2x fa-caret-up' "></i>
                      <div class="text-sm format_float" x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' " x-text="cur_month - last_month">0 </div>
                      <small x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' "> 
                        <span  x-text="diff">0</span>%</small> 
                      <small class="text-secondary" x-html="suffix">prev month</small>
                     </div>
                    </div>
                  </div>
                  </div>
              `
            }
            if (this.style == "Block") {
                inner_html = `
                <div class="card-header bg-primary text-white" x-html="title"></div>  
                <div class="card-body">
                  <div class="row" ">
                    <div class="col-sm-12 d-flex justify-content-around align-items-center">
                      <div class="text-lg" x-html="cur">0</div>
                      <div x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' " class="d-flex align-items-center justify-content-between">
                          <i x-bind:class="cur_month < last_month ? 'fa fa-2x fa-caret-down' : 'fa fa-2x fa-caret-up' "></i>
                          <div class="text-sm format_float" x-text="cur_month - last_month">0 </div> 
                          (<span  x-text="diff">0</span>%)
                      </div>
                      <small class="text-secondary">prev month</small>
                    
                    </div>
                  </div>
                </div>
              `
            }
            var html = `

              <div class="card"  x-data="{
                  title: '` + this.title + `',
                  cur_month: ` + this.cur + `,
                  last_month: ` + this.prev + `,
                  suffix: '` + this.suffix + `',
                  diff: ` + this.diff + `,
                  icon_map: '` + this.icon_map + `',
                  cur: '` + (this.decimal ? currencyFormat(parseFloat(this.cur)) : this.cur) + `'
                }">
                ` + inner_html + `
               
             </div>

            `
            dom.append(html)
            $(this.postFns).each((i, v) => {
                setTimeout(() => {
                    v(".float");
                }, 100)

            })

        },
        statusCard(dom, options) {
            var icon_map, title, quantity, style, color, button

            var default_options = {
                title: 'Total Sales <small>(MYR)</small>',
                quantity: 20,
                icon_map: "fa fa-wallet fa-2x",
                style: "basic",
                color: 'bg-success',
                btn: '<div class="btn btn-success">New</div>'
            }
            var keys =
                Object.keys(default_options)

            keys.forEach((v, i) => {
                this[v] = default_options[v]
            })
            keys.forEach((v, i) => {
                if (options[v] != null) {
                    this[v] = options[v]
                }
            })
            var html

            if (this.style == "tile") {
                html = `

                    <div class="card rounded-lg" x-data="{
                    icon_map: '` + this.icon_map + `',
                    title: '` + this.title + `',
                    quantity: ` + this.quantity + `,
                    color: '` + this.color + `',


                    }">
                      <div x-bind:class="color" class="card-body text-center " 
                      style="border-top-left-radius: 0.3rem;border-top-right-radius: 0.3rem;">
                        <i style="opacity: 0.7" x-bind:class="icon_map" class="text-white fa-4x"></i>
                      </div>
                      <div class="card-body text-center">
                        <div class="text-xl" x-text="quantity">13</div>
                        <div class="text-lg text-secondary" x-html="title">Stores</div>
                        
                      </div>
                      <div class="card-body text-center" >
                      ` + this.btn + `
                      </div>
                    </div>
                    `
            }

            if (this.style == "horizontal") {
                html = `
                  <div class="card" x-data="{
                    icon_map: '` + this.icon_map + `',
                    title: '` + this.title + `',
                    quantity: ` + this.quantity + `,
                    color: '` + this.color + `'

                  }">
                    <div class="card-body p-0">
                      <div class="row no-gutters">
                        <div x-bind:class="color" class="col-4 d-flex justify-content-center align-items-center" 
                        style="border-top-left-radius: 0.3rem;border-bottom-left-radius: 0.3rem;">
                          <i x-bind:class="icon_map" class="text-white" style="opacity: 0.4"></i>
                        </div>
                        <div class="col-8 bg-white">
                          <div class="p-2 text-center">
                            <div class="text-lg" x-text="quantity">121</div>
                            <div class="text-secondary" x-html="title">Users</div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  `
            }

            if (this.style == "basic") {

                html = `

                <div class="card" x-data="{
                  icon_map: '` + this.icon_map + `',
                  title: '` + this.title + `',
                  quantity: ` + this.quantity + `,
                }">
                  <div class="card-body text-center">
                    <i x-bind:class="icon_map" class="pb-3 text-primary" style="opacity: 0.4"></i>
                    <div class="text-lg text-secondary" x-html="title">Title</div>
                    <div class="text-xl" x-text="quantity">0</div>
                    
                  </div>
                </div>

              `
            }
            $(dom).html(html)



        }
    }
}

function currencyFormat(num) {
    if (num == null) {

        return "0.00"
    } else {
        return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
}

function formatDate() {

    $(".format_float").each((i, v) => {
        var prefix = ""
        if ($(v).html().split(" ").includes("DR")) {
            prefix = "DR"
        }
        if ($(v).html().split(" ").includes("CR")) {
            prefix = "CR"
        }
        var content = $(v).html().replace("-", "")

        if (parseFloat(content) > 0) {
            var span = `<span class="text-right" >` + currencyFormat(parseFloat(content)) + ` ` + prefix + `</span>`
            $(v).html(span)

        } else if (parseFloat(content) == 0) {
            $(v).html("0.00")
        } else {
            $(v).html(content)
        }

    })

    $(".format_date").each((i, v) => {
        // console.log() 
        var d = $(v).html();
        if (Date.parse(d) > 0) {
            var date = new Date(d)
            var day;
            if (date.getDate().toString().length > 1) {
                day = date.getDate()
            } else {
                day = "0" + date.getDate()
            }
            var month;
            if ((date.getMonth() + 1).toString().length > 1) {
                month = (date.getMonth() + 1)
            } else {
                month = "0" + (date.getMonth() + 1)
            }

            $(v).html("<b>" + day + "-" + month + "-" + date.getFullYear() + "</b>")
        } else {
            $(v).html(d)

        }

    })
    $(".format_datetime").each((i, v) => {

        // console.log() 
        var d = $(v).html();
        if (Date.parse(d.split(" ")[0]) > 0) {
            var date = new Date(d.split(" ")[0])
            var day;
            if (date.getDate().toString().length > 1) {
                day = date.getDate()
            } else {
                day = "0" + date.getDate()
            }
            var month;
            if ((date.getMonth() + 1).toString().length > 1) {
                month = (date.getMonth() + 1)
            } else {
                month = "0" + (date.getMonth() + 1)
            }

            $(v).html("<b>" + day + "-" + month + "-" + date.getFullYear() + " " + d.split(" ")[1] + "</b>")
        }

    })

    $(".is_posted").each((i, v) => {

        // console.log() 
        var d = $(v).html();
        if (d == "true") {
            $(v).html(`
                <i class="text-success fa fa-check"></i>
                `)
        }

        if (d == "false") {
            $(v).html(`
                <i class="text-danger fa fa-exclamation-circle"></i>
                `)
        }


    })


}
$(document).ready(function(){
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    $("#content").data({"year":year, "month":month+1});
    createCalendar(year, month);
    $("#left button").on('click', function(){ // last month
        if(month==0){
            year = year - 1;
            month = 11;
        }
        else{
            month = month-1;
        }
        createCalendar(year, month);
    });
    $("#right button").on('click', function(){ // next month
        if(month==11){
            year = year + 1;
            month = 0;
        }
        else{
            month = month+1;
        }
        createCalendar(year, month);
    });
    $("*").on('click', function(event){
        event.stopPropagation()
        if(!$(event.target).is('#schedule_list li')){
            $('.menu').hide();
        }
    })
});

function createCalendar(year, month){
    $("#content").data({"year":year, "month":month+1});
    $("#schedule").removeData(['year', 'month', 'date']);
    $("#calendar .block").remove();
    $("#schedule_list *").remove();
    const day = ["Sun", "Mon", "Tue", "Thu", "Wed", "Fri", "Sat"];
    $("#month").text(year+"/"+(month+1));
    let firstDay = new Date(year, month, 1).getDay();
    if(firstDay!==0){ // First day is not sunday
        Array.from({length: firstDay}, () => {
            $("#calendar").append($("<div class='block'>"));
        });
    }
    if(month+1==2){ // Feb
        if(((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)){
            var loop = 29;
        }
        else{
            var loop = 28;
        }
    }
    else if((month+1)%2==0){ // 30
        var loop = 30;
    }
    else{ // 31
        var loop = 31;
    }
    $.ajax({
        type : "GET",
        url : "./calendar/getMonthSchedule",
        data: {"year":year, "month":month+1},
        dataType : "json",
        success : function(data){
            Array.from({length: loop}, (x,i) => {
                let block = $("<div class='block'>"+(i+1)+"</div>")
                .data({"year":year, "month":month+1, "date":i+1, "day":day[(firstDay + i) % 7]})
                .on('click', getSchedule).append(
                    $("<div class='block_schedule'>").text(updateBlockText(data[i+1]))
                    .data({"year":year, "month":month+1, "date":i+1, "day":day[(firstDay + i) % 7]}));
                $("#calendar").append(block);
            });
            $("#calendar .block").each(function(){
                if($(this).data("day")==="Sat"){
                    $(this).addClass("saturday");
                }
                else if($(this).data("day")==="Sun"){
                    $(this).addClass("sunday");
                }
            });
        },
        error : function(xhr){
            console.log(xhr.responseText);
        }
    });
}

function getSchedule(event){
    $("#schedule_list").empty();
    let year = $(event.target).data("year");
    let month = $(event.target).data("month");
    let date = $(event.target).data("date");
    $("#schedule").data({"year":year, "month":month, "date":date});
    $.ajax({
        type : "GET",
        url : "./calendar/getDaySchedule",
        data: {"year":year, "month":month, "date":date},
        dataType : "json",
        success : function(data){
            Object.keys(data).forEach(function(key, i){
                updateSchedulelist(data[key], key);
            });
            let inputdiv = $("<div id='input_field'>");
            let addButton = $("<button type='button'>").text("+").on('click', InputSchedule);
            $("#schedule_list").append(inputdiv.append($("<br>"), addButton));
        },
        error : function(xhr){
            console.log(xhr.responseText);
        }
    });
}

function InputSchedule(event){
    let input = $("<input type='text'>");
    let saveButton = $("<button type='button'>Save</button>").on('click', function(){
        $.ajax({
            type : "PUT",
            url : "./calendar/addSchedule",
            data : {"schedule":input.val(), "year":$("#schedule").data("year"),
            "month":$("#schedule").data("month"), "date":$("#schedule").data("date")},
            dataType : "json",
            success : function(data){
                updateSchedulelist(data.schedule, data.id);
                $("#input_field *").remove();
                let addButton = $("<button type='button'>").text("+").on('click', InputSchedule);
                $("#input_field").append($("<br>"), addButton);
                $("#schedule_list li:last").after($("#input_field"));
                $(".block_schedule").each(function(){
                    if($(this).data("year") === data.year && $(this).data("month") === data.month && $(this).data("date") === data.date){
                        $(this).text(updateBlockText(data.schedules));
                        return false;
                    }
                })
            },
            error : function(xhr){console.log(xhr.responseText)}
        });
    });
    let cancelButton = $("<button type='button'>Cancel</button>").on('click', function(){
        $("#input_field *").remove();
        let addButton = $("<button type='button'>").text("+").on('click', InputSchedule);
        $("#input_field").append(addButton);        
    });
    $(event.target).remove();
    $("#input_field").append(input, $("<br>"), saveButton, cancelButton);
}

function deleteSchedule(event){
    let scheduleID = $(event.target).parents("li").data("id");
    $.ajax({
        type : "DELETE",
        url : "./calendar/removeSchedule",
        data : {"id":scheduleID},
        dateType : "json",
        success : function(data){
            $(event.target).parents("li").remove();
            $(".block_schedule").each(function(){
                if($(this).data("year") === data.year && $(this).data("month") === data.month && $(this).data("date") === data.date){
                    $(this).text(updateBlockText(data.schedules));
                    return false;
                }
            })
        },
        error : function(xhr){
            console.log(xhr.responseText);
        },
    });
}

function modifySchedule(event){
    let selected = $(event.target).parents("li");
    let input = $("<input type='text'>").val(selected[0].firstChild.textContent);
    let modifyButton = $("<button type='button'>Modify</button>").on('click', function(){
        $.ajax({
            type : "PATCH",
            url : "./calendar/modifySchedule",
            data : {"schedule" : input.val(), "id":selected.data("id")},
            dataType : "json",
            success : function(data){
                selected[0].firstChild.textContent = input.val();
                selected.show();
                newlist.remove();
                $(".block_schedule").each(function(){
                    if($(this).data("year") === data.year && $(this).data("month") === data.month && $(this).data("date") === data.date){
                        $(this).text(updateBlockText(data.schedules));
                        return false;
                    }
                });
            },
            error : function(xhr){console.log(xhr.responseText)}
        });
    });
    let cancelButton = $("<button type='button'>Cancel</button>").on('click', function(){
        selected.show();
        newlist.remove();
    });
    let newlist = $("<li>").append(input, $("<br>"), modifyButton, cancelButton);
    selected.after(newlist);
    selected.hide();
}

function updateSchedulelist(schedule, id){
    let modifyMenu = $("<div class='menulist'>Modify</div>").on('click', modifySchedule);
    let deleteMenu = $("<div class='menulist'>Delete</div>").on('click', deleteSchedule);
    $("#schedule_list").append($("<li>").text(schedule).data("id", id)
    .on('click', function(event){
        $('.menu').hide();
        $(this).children("*").show();
    })
    .append($("<div class='menu'>").append(modifyMenu, deleteMenu).hide()));
}

function updateBlockText(schedules){
    let text = "";
    if(schedules){
        schedules.slice(0,3).forEach(function(value){
            if(value.length<=12){
                text=text+value+" ";
            }
            else{
                text=text+value.substr(0, 13)+".. "
            }
        });
        if(schedules.length>3){
            text += "\n..."
        }
    }
    return text;
}
var audio = new Audio('/static/audio/alert.mp3'); 
var pollingInterval = 5000;
var runningInterval;



function strip(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function setAlert(typ, message) {
    // message = strip(message)
    html = ""
    html+= '<div class="alert alert-dismissible alert-' + typ + '">'
    html+= '<button type="button" class="close" data-dismiss="alert">&times;</button>'
    html+= '<strong>' + message + '</strong>'
    html+= '</div>'
    $("#alert").html(html)
}

function getTx(tid, successCallback, failureCallback) {
    $.ajax({
        type: "GET",
        url: "//btc.blockr.io/api/v1/tx/info/" + tid,
        error: failureCallback,
        success: function(resp){
            successCallback(resp)
        } 
    });
}

function startAlarm() {
    audio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    audio.play();
}

function stopAlarm() {
    audio.pause()
}

function resetUI() {
    document.title = 'TxTimer';
    $("#conf_view").hide()
}

function resetInterval() {
    clearInterval(runningInterval)
    runningInterval = null
}

function startConfWatch(tx, confs) {
    resetInterval()
    $("#conf_view").show()
    function check() {
        getTx(tx, function(resp){
            data = resp.data
            // console.log(data)
            $("#current_confs").text(data.confirmations)
            $("#total_confs").text(confs)
            barPct = data.confirmations / confs
            if(barPct > 1) {
                barPct = 1
            }
            document.title = '(' + data.confirmations + '/' + confs + ')' + ' TxTimer';
            $("#conf_bar").css("width", barPct*100 + "%")
            if(data.confirmations >= confs){
              $("#stop_alarm").show()
               startAlarm()
               resetInterval() 
               return
            }
            console.log("At " + data.confirmations + "confs, want " + confs)
        }) 
    }
    check()
    runningInterval = setInterval(check, pollingInterval)
}

//notify button pressed
$("#notify").submit(function(e){
    e.preventDefault()
    console.log(e)

    //should be replaced by tx validator in the future
    getTx($("#txid").val(), function(data){
        setAlert("info", "Ok. I'll sing when <a href='https://blockchain.info/tx/" + $("#txid").val() + "'>" + $("#txid").val() + "</a> is at " + $("#confirmation_limit").val() + " confirmations")
        startConfWatch($("#txid").val(), $("#confirmation_limit").val())
    }, function(){
        setAlert("danger", "Getting transaction information failed. Check your TX id.")
    })
})

$("#stop_alarm").click(function(){
    $(this).hide()
    stopAlarm()
    resetUI()
})

//tab close event
window.onbeforeunload = function() {
    if(runningInterval != null) {
        return "Hey, you've got an active timer. Are you sure you want to leave?"
    }
}
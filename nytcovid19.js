console.log('nytcovid19.js loaded');

nytcovid19={
    date:Date(),
    data:{}, // cache it here
    urlStates:'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv',
    urlCounties:'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv',
    urlFips:'https://raw.githubusercontent.com/josh-byster/fips_lat_long/master/fips_map.json'
}

nytcovid19.getStates=async(urlStates=nytcovid19.urlStates)=>{
    let txt = await (await fetch(urlStates)).text()
    let arr =txt.split(/[\n\r]+/).map(r=>r.split(','))
    let labels=arr[0]
    let dt={}
    arr.slice(1).forEach(r=>{
        dt[r[1]]={}
        dt[r[1]][labels[0]]=new Date(r[0])   // date
        dt[r[1]][labels[2]]=parseFloat(r[2]) // fips
        dt[r[1]][labels[3]]=parseFloat(r[3]) // cases
        dt[r[1]][labels[4]]=parseFloat(r[4]) // deaths
    })
    return dt
}

nytcovid19.getAllData=async(urlStates=nytcovid19.urlStates,urlCounties=nytcovid19.urlCounties,urlFips=nytcovid19.urlFips)=>{
    let fips = await (await fetch(urlFips)).json()
    let dt = await nytcovid19.getStates(urlStates=nytcovid19.urlStates)
    let txt = await (await fetch(urlCounties)).text()
    let arr =txt.split(/[\n\r]+/).map(r=>r.split(','))
    let labels=arr[0]
    arr.slice(1).forEach(r=>{
        if(dt[r[2]]){
            if(!dt[r[2]].counties){
                dt[r[2]].counties={}
            }
            dt[r[2]].counties[r[1]]={}
            dt[r[2]].counties[r[1]][labels[0]]=new Date(r[0]) //date
            dt[r[2]].counties[r[1]][labels[3]]=parseFloat(r[3]) // fips
            dt[r[2]].counties[r[1]][labels[4]]=parseFloat(r[4]) // cases
            dt[r[2]].counties[r[1]][labels[5]]=parseFloat(r[5]) // deaths
            let fipsi = fips[dt[r[2]].counties[r[1]][labels[3]]=parseFloat(r[3])]
            if(fipsi){ // if there is fips geo coordinates in Josh's file for this fips location
                dt[r[2]].counties[r[1]].lat=fipsi.lat,
                dt[r[2]].counties[r[1]].long=fipsi.long
            }
        }else{
            // i.e. "Northern Mariana Islands" assigned to "Unknown" state
            // debugger 
        }   
    })
    return dt
}

//nytcovid19.getScript = async function(url){await import(url)}

nytcovid19.getScript = async function(url){
    return new Promise(function(resolve,reject){
        let s = document.createElement('script')
        s.src=url
        s.onload=_=>{
            setTimeout(_=>{delete s},1000)
            resolve(`${url} loaded`)
        }
        s.onerror=_=>reject(Error(`error loading ${url}`))
        document.head.appendChild(s)
    })
}

nytcovid19.plotly=async function(){
    if(typeof(Plotly)=='undefined'){
        await nytcovid19.getScript('https://cdn.plot.ly/plotly-latest.min.js')
    }
}

if(typeof(define)!='undefined'){
    define(nytcovid19)
}
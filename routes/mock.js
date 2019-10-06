module.exports = function(app) {
  app.get("/schedule_mock", (req, res) => {
    res.send({
      "start": "10:00 am",
      "end": "7:50 pm",
      "startDate": "Apr 29, 2019",
      "today": [{
        "name": "PSYC 2310-01",
        "CRN": "75353",
        "start_time": "10:00 am",
        "end_time": "11:50 am",
        "location": "TROY 2015"
      }, {
        "name": "CSCI 2300-02",
        "CRN": "71332",
        "start_time": "12:00 pm",
        "end_time": "1:50 pm",
        "location": "SAGE 3303"
      }, {
        "name": "PSYC 4410-02",
        "CRN": "75360",
        "start_time": "2:00 pm",
        "end_time": "3:50 pm",
        "location": "SAGE 3101"
      }],
      "clinfo": [
        [{
          "name": "PSYC 2310-01",
          "CRN": "75353",
          "start_time": "10:00 am",
          "end_time": "11:50 am",
          "location": "TROY 2015"
        }, {
          "name": "CSCI 2300-02",
          "CRN": "71332",
          "start_time": "12:00 pm",
          "end_time": "1:50 pm",
          "location": "SAGE 3303"
        }, {
          "name": "PSYC 4410-02",
          "CRN": "75360",
          "start_time": "2:00 pm",
          "end_time": "3:50 pm",
          "location": "SAGE 3101"
        }],
        [{
          "name": "COGS 4210-01",
          "CRN": "73948",
          "start_time": "10:00 am",
          "end_time": "11:50 am",
          "location": "LOW 4034"
        }, {
          "name": "COGS 4330-01",
          "CRN": "73730",
          "start_time": "2:00 pm",
          "end_time": "3:50 pm",
          "location": "LOW 3045"
        }, {
          "name": "CSCI 4963-04",
          "CRN": "75530",
          "start_time": "4:00 pm",
          "end_time": "5:50 pm",
          "location": "SAGE 4112"
        }],
        [{
          "name": "CSCI 2300-02",
          "CRN": "71332",
          "start_time": "2:00 pm",
          "end_time": "3:50 pm",
          "location": "SAGE 2715"
        }],
        [{
          "name": "PSYC 2310-01",
          "CRN": "75353",
          "start_time": "10:00 am",
          "end_time": "11:50 am",
          "location": "TROY 2015"
        }, {
          "name": "CSCI 2300-02",
          "CRN": "71332",
          "start_time": "12:00 pm",
          "end_time": "1:50 pm",
          "location": "SAGE 3303"
        }, {
          "name": "PSYC 4410-02",
          "CRN": "75360",
          "start_time": "2:00 pm",
          "end_time": "3:50 pm",
          "location": "SAGE 3101"
        }, {
          "name": "CSCI 2300-02",
          "CRN": "71332",
          "start_time": "6:00 pm",
          "end_time": "7:50 pm",
          "location": "WEST AUD"
        }],
        [{
          "name": "COGS 4210-01",
          "CRN": "73948",
          "start_time": "10:00 am",
          "end_time": "11:50 am",
          "location": "LOW 4034"
        }, {
          "name": "COGS 4330-01",
          "CRN": "73730",
          "start_time": "2:00 pm",
          "end_time": "3:50 pm",
          "location": "LOW 3045"
        }, {
          "name": "CSCI 4963-04",
          "CRN": "75530",
          "start_time": "4:00 pm",
          "end_time": "5:50 pm",
          "location": "SAGE 4112"
        }]
      ]
    });
  });
}
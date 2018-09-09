


p = [ { x: 589.7637939453125, y: 638.1448364257812 },
     { x: 347.7755126953125, y: 628.8375854492188 },
     { x: 357.6942138671875, y: 370.9498291015625 },
     { x: 599.6824951171875, y: 380.257080078125 } ];


function sortPoint(points){
  //1:Upper left, 2:Lower left, 3:Upper right, 4:Lower right
  var upper_left_index;
  var lower_left_index;
  var upper_right_index;
  var lower_right_index;

  var x_with_index = [];
  for (var i=0; i<points.length;i++) {
    x_with_index.push([points[i].x, i]);
  }

  x_with_index.sort(function(left, right) {
  	return left[0] < right[0] ? -1 : 1;
  });
  var indices = [];
  xs = [];
  for (var j in x_with_index) {
  	xs.push(x_with_index[j][0]);
  	indices.push(x_with_index[j][1]);
  }

  left_indices = indices.slice(0,2);
  right_indices = indices.slice(2,4);

  if(points[left_indices[0]].y < points[left_indices[1]].y ){
  	upper_left_index = left_indices[0];
  	lower_left_index = left_indices[1];
  } else {
  	upper_left_index = left_indices[1];
  	lower_left_index = left_indices[0];
  }

  if(points[right_indices[0]].y < points[right_indices[1]].y ){
  	upper_right_index = right_indices[0];
  	lower_right_index = right_indices[1];
  } else {
  	upper_right_index = right_indices[1];
  	lower_right_index = right_indices[0];
  }

  console.log("upper left:",points[upper_left_index]);
  console.log("lower left:",points[lower_left_index]);
  console.log("upper right:",points[upper_right_index]);
  console.log("lower right:",points[lower_right_index]);

}

function computeCenterOfGravity(points){
          sumx = 0;
          sumy = 0;
          for(var i=0;i<points.length;i++){
            sumx += points[i].x;
            sumy += points[i].y;
          }
          cgx = sumx / points.length;
          cgy = sumy / points.length;
          console.log(cgx,cgy);
}

sortPoint(p);

computeCenterOfGravity(p);
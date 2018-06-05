// (function ($) {
	
	var table = $('.table');
	var tmp_storage = [];
	table.delegate('td', 'click', function () {
		var _self = $(this);
		

		if(_self.hasClass('selected')){
			_self.removeClass('selected');
			// TODO 동일한 것을 다시 선택할 경우 해당 배열을 제거해야 한다.
			cancelSelected('시작영역을 다시 선택하세요.');
			return;
		}else{
			_self.addClass('selected');
		}

		var row = _self.parent().index();
		var column = _self.index();

		console.log('row : ' + row + ' / column : ' + column);

		if(tmp_storage.length === 0){
			console.log('first push data');

			if(_self.attr('rowspan') > 1){
				console.log('병합된 셀을 첫번째로 선택하는 경우');
				var i=row, size=parseInt(_self.attr('rowspan')) + parseInt(row);

				for(;i<size;i++){
					tmp_storage.push({
						c: column,
						r: i
					});	
				}
			}else{
				tmp_storage.push({
					c: column,
					r: row
				});	
			}

			return;
		}

		if(tmp_storage[tmp_storage.length-1].c !== column){
			cancelSelected('동일한 칼럼에서만 지정할 수 있습니다.');
			return;
		}

		// 병합된 셀을 선택하게 될 경우 실제 그 병합된 셀을 모두 선택한 것처럼 배열에 해당 값을 넣을 수 있도록 한다.
		if(_self.attr('rowspan') > 1){
			console.log('병합된 셀이 : ' +  _self.attr('rowspan'));

			// 상단의 코드와 중복되는 지점
			console.log('두번째로 선택된 셀이 병합된 셀일 경우');
			console.log('row ' + row);

			var i=row, size=parseInt(_self.attr('rowspan')) + parseInt(row);

			for(;i<size;i++){
				tmp_storage.push({
					c: column,
					r: i
				});	
			}

		}else{
			console.log('하나의 셀');

			tmp_storage.push({
				c: column,
				r: row
			});
		}


		if(tmp_storage.length > 1){
			console.log(tmp_storage[tmp_storage.length-1].r)
			console.log('current : ' + row);
			console.log( Math.abs(tmp_storage[tmp_storage.length-1].r - row) );	
		}
		

		// TODO 병합된 셀을 선택 후에 바로 위의 칼럼을 선택할 경우 문제가 된다.
		
		// if(Math.abs(tmp_storage[tmp_storage.length-2].r - row) > 1){
		// 	cancelSelected('연속된 영역을 선택해야 합니다.');	
		// 	return;
		// } 

		// 중간에 건너띄어서 셀이 선택이 되지 않아야 한다.
		// 선택영역간에 rowspan이라는 것이 있고 그걸 통해서 계산한 결과 연속된 지점이라도 판단이 된다면 ok
		// 만약 연속된 구간이 아니라고 판단이 되면 모두 선택 해제
		// 그럼 연속된 구간이라는 것을 어떻게 판단을 할 수가 있을 것인가???

		
		
		// 순서대로 정렬을 한 후에 중간에 순서가 빠져 있는지 확인하고 순서가 빠진 경우 전체 선택을 해제하고 배열을 비운다.
		// 그럼 일단 r만 따로 배열에 정리하여 넣은 뒤에 sort()로 정렬하고 순차적으로 이동하면서 빈 구석이 있는지 확인한다.
		var tmp_single_row = [];
		for(var i=0,size=tmp_storage.length;i<size;i++){
			tmp_single_row.push(tmp_storage[i].r);
		}

		tmp_single_row = tmp_single_row.sort();

		console.log('총 선택된 영역이 중간이 빠진 것이 없는지 확인하기 위해서');
		console.log(tmp_single_row);
		
		var tmp_selected_value = null;
		for(var i=0,size=tmp_single_row.length;i<size;i++){
			if(tmp_selected_value == null){
				tmp_selected_value = tmp_single_row[i];
			}

			if(Math.abs(tmp_single_row[i] - tmp_selected_value) > 1){
				console.log('순차적이지 않으므로 모두 해제!!');
				cancelSelected('선택된 영역이 잘못되었습니다.');
				return;
			}
			tmp_selected_value = tmp_single_row[i];
		}

		
		console.log(column + ' / ' + row);

	});

	function cancelSelected(msg){
		table.find('td').removeClass('selected');
		tmp_storage = [];
		console.log(msg);
	}


	function mergeSelected(msg){
		if(tmp_storage.length <= 1){
			alert('병합할 영역을 하나 이상 선택하세요.');
			return;
		}

		
		var tmp_min = null, arr_pos = null;

		for(var i=0,size=tmp_storage.length;i<size;i++){
			if(tmp_min == null){
				tmp_min = tmp_storage[i].r;
			}

			if(tmp_storage[i].r <= tmp_min){
				tmp_min = tmp_storage[i].r;
				arr_pos = i;
			}
		}
		
		console.log('min row ' + tmp_min);
		console.log('arr pos ' + arr_pos);

		for(var i=0,size=tmp_storage.length;i<size;i++){
			if(i === arr_pos){
				console.log( 'start column ' + tmp_storage[i].c );
				console.log( 'start row ' + tmp_storage[i].r );

				table.find('tr').eq(tmp_storage[i].r).children('td').eq(tmp_storage[i].c).attr('rowspan', tmp_storage.length);
			}else{
				console.log( 'blind column ' + tmp_storage[i].c );
				console.log( 'blind row ' + tmp_storage[i].r );
				table.find('tr').eq(tmp_storage[i].r).children('td').eq(tmp_storage[i].c).addClass('blind');
			}
		}


		table.find('td').removeClass('selected');
		tmp_storage = [];

		console.log(msg);
	}

	$('.js-btn-merge').bind('click', function () {
		mergeSelected('병합되었습니다.');
	});

	$('.js-btn-cancel').bind('click', function () {
		cancelSelected('선택영역이 취소되었습니다.');
	});


//}(jQuery));
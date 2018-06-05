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

			for(var i=row,size=_self.attr('rowspan');i<size;i++){
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
		

		// 병합된 셀을 선택 후에 바로 위의 칼럼을 선택할 경우 문제가 된다.
		// 따라서 아래의 로직을 변경해야 한다.
		if(Math.abs(tmp_storage[tmp_storage.length-2].r - row) > 1){
			cancelSelected('연속된 영역을 선택해야 합니다.');	
			return;
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
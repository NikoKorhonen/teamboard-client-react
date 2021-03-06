'use strict';

var React  = require('react');
var Hammer = require('hammerjs');

var props         = require('../constants/props');
var gridify       = require('../utils/gridify');
var TicketColor   = require('../constants/enums').TicketColor;
var TicketActions = require('../actions/ticket');

var TICKET_WIDTH  = require('../constants').TICKET_WIDTH;
var TICKET_HEIGHT = require('../constants').TICKET_HEIGHT;

/**
 * Surface with a background and a specific size. Clicking on the surface
 * creates a new 'Ticket'.
 */
var Board = React.createClass({
	propTypes: {
		/**
		 * The 'board' we are representing.
		 */
		board: props.Board.isRequired,

		/**
		 * The 'snap' property indicates whether to snap created tickets to a
		 * grid of 'ticket.width' x 'ticket.height'.
		 */
		snap: React.PropTypes.bool,

		/**
		 * The 'sidebarWidth' property indicates the current width of the
		 * sidebar. Used for calculating the absolute position of new tickets.
		 */
		sidebarWidth: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			snap:         false,
			sidebarWidth: 80,
		}
	},

	componentDidMount: function() {
		this.hammer = new Hammer.Manager(this.getDOMNode());
		this.hammer.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));

		// Setup a listener for our custom 'doubletap' event, which is used
		// here to add new tickets.
		this.hammer.on('doubletap', function addTicket(ev) {
			// We need to take into account the static sidebar when calculating
			// the pointer position.
			ev.center.x = ev.center.x - this.props.sidebarWidth;

			// Calculate the position to be at the center of the ticket. Since
			// the 'Board' component is wrapped by a 'Scrollable', we receive
			// an 'offset' property.
			// If the user has enabled snapping, we also need to make sure to
			// snap the position to a grid.

			var pos = {
				x: (ev.center.x - this.props.offset.x) - (TICKET_WIDTH / 2),
				y: (ev.center.y - this.props.offset.y) - (TICKET_HEIGHT / 2),
			}
			var endpos = this.props.snap ? gridify(pos) : pos;

			// Finally we need to clamp the position so that it does not go
			// over the bounds of the board.

			var boardSize = this.props.board.size;

			endpos.x = endpos.x < 0 ?
				0 : ((endpos.x + TICKET_WIDTH) > boardSize.width ?
					(boardSize.width - TICKET_WIDTH) : endpos.x);

			endpos.y = endpos.y < 0 ?
				0 : ((endpos.y + TICKET_HEIGHT) > boardSize.height ?
					(boardSize.height - TICKET_HEIGHT) : endpos.y);

			return TicketActions.addTicket(this.props.board.id, {
				color:    TicketColor.VIOLET,
				content:  '',
				position: endpos,
			});
		}.bind(this));
	},

	render: function() {
		return (
			/* jshint ignore:start */
			<div className="board" style={this.props.board.size}>
				{this.props.children}
			</div>
			/* jshint ignore:end */
		);
	},
});

module.exports = Board;

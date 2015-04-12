var UserIdentity = require('../../../src/domain/identity/UserIdentity');
var UserId = require('../../../src/domain/UserId').UserId;
var Session = require('../../../src/domain/identity/Session');
var expect = require('chai').expect;

describe('User Identity Aggregate', function() {
    var email = 'user@mix-it.fr';

    var eventsRaised = [];
    var publishEvent = function publishEvent(evt){
        eventsRaised.push(evt);
    };

    beforeEach(function(){
        eventsRaised = [];
    });

    it('When register user Then raise userRegistered event', function() {
        UserIdentity.register(publishEvent, email);

        var expectedEvent = new UserIdentity.UserRegistered(new UserId(email));
        expect(eventsRaised).to.contains(expectedEvent);
    });

    it('Given UserRegistered When log in Then raise UserConnected event', function(){
        var id = new UserId(email);
        var userIdentity = UserIdentity.create([ new UserIdentity.UserRegistered(id) ]);

        userIdentity.logIn(publishEvent);

        expect(eventsRaised).to.have.length(1);
        var event = eventsRaised[0];
        expect(event).to.be.an.instanceof(Session.UserConnected);
        expect(event.userId).to.equal(id);
        expect(event.connectedAt - new Date()).to.within(-1, 1);
        expect(event.sessionId).not.to.be.empty;
    });

    it('When log in Then return sessionId', function(){
        var id = new UserId(email);
        var userIdentity = UserIdentity.create([ new UserIdentity.UserRegistered(id) ]);

        var result = userIdentity.logIn(publishEvent);

        var event = eventsRaised[0];
        expect(result).to.equal(eventsRaised[0].sessionId);
    });

    it('When create UserRegistered Then aggregateId is userId', function() {
        var id = new UserId(email);
        var event = new UserIdentity.UserRegistered(id);

        expect(event.getAggregateId()).to.equal(id);
    });

    it('When register user with empty email Then throw UserEmailCannotBeEmpty exception', function() {
        expect(function() {
            UserIdentity.register(publishEvent, "");
        }).to.throw(UserIdentity.UserEmailCannotBeEmpty);
    });
});
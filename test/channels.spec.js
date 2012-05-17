var noop = function () {};

describe('Channels', function () {
  beforeEach(function () {
    var finished = false;

    runs(function () {
      this.spire = createSpire();

      if (this.secret) {
        this.spire.start(this.secret, function (err) {
          finished = true;
        });
      } else {
        this.spire.register({
          email: helpers.randomEmail(),
          password: 'foobarbaz'
        }, function (err) {
          finished = true;
        });
      }
    });

    waitsFor(function () {
      return finished;
    }, 'Session registration or start', 10000);
  });

  describe('Publish to a channel using spire.publish', function () {
    beforeEach(function () {
      var finished = false;

      runs(function () {
        var that = this;
        this.spire.session.publish('a channel', 'my message', function (err, message) {
          that.message = message;
          finished = true;
        });
      });

      waitsFor(function () {
        return finished;
      }, 10000, 'Publish to a non-existant channel');
    });

    it('should return the message', function () {
      expect(this.message.content).toBe('my message');
    });

    describe('Listen to a channel using spire.session.subscribe with no options', function () {
      beforeEach(function () {
        var finished = false;

        runs(function () {
          var that = this;
          this.spire.session.publish('another channel', 'message one', function () {
            that.spire.session.publish('another channel', 'message two', function () {
              that.spire.session.subscribe('another channel', function (messages) {
                that.messages = messages;
                finished = true;
              }, function (err, subscription) {
                that.subscription = subscription;
              });
            });
          });
        });

        waitsFor(function () {
          return finished;
        }, 10000, 'spire.subscribe');
      });

      it('should return the messages', function () {
        expect(this.messages.length).toBe(2);
        expect(this.messages[0].content).toBe('message one');
        expect(this.messages[1].content).toBe('message two');
        this.subscription.stopListening();
      });
    });
  });

  describe('Create a channel', function () {
    beforeEach(function () {
      var finished = false;

      runs(function () {
        var that = this;
        this.spire.session.createChannel('foo', function (err, channel) {
          finished = true;
          that.channel = channel;
        });
      });

      waitsFor(function () {
        return finished;
      }, 'channel get or create', 10000);
    });

    it('should return a channel resource', function () {
      expect(this.channel).toBeTruthy();
      expect(this.channel).toBeAResourceObject();
    });

    describe('Creating a channel with the same name', function () {
      beforeEach(function () {
        var finished = false;

        runs(function () {
          var that = this;
          this.spire.session.findOrCreateChannel('foo', function (err, channel) {
            finished = true;
            that.channel2 = channel;
          });
        });

        waitsFor(function () {
          return finished;
        }, 'channel get or create', 10000);
      });

      it('should be the same channel as before', function () {
        expect(this.channel2.url()).toEqual(this.channel.url());
      });
    }); // Creating a channel with the same name

    describe('Getting a channel by  name', function () {
      beforeEach(function () {
        var finished = false;
        runs(function () {
          var that = this;
          this.spire.session.channelByName('foo', function (err, channel) {
            finished = true;
            that.channel3 = channel;
          });
        });

        waitsFor(function () {
          return finished;
        }, 'get a channel by name', 10000);
      });

      it('should be the same channel as before', function () {
        expect(this.channel3.url()).toEqual(this.channel.url());
      });
    });

    describe('Publish to a channel', function () {
      beforeEach(function () {
        var finished = false;
        runs(function () {
          var that = this;
          this.messages = this.channel.publish('Hello world!', function (err, message) {
            that.message = message;
            finished = true;
          });
        });

        waitsFor(function () {
          return finished;
        }, 'publish to channel', 10000);
      });

      it('Returns the message we sent', function () {
        expect(this.message.content).toBe('Hello world!');
      });

      describe('Create a subscription to a channel', function () {
        beforeEach(function () {
          var finished = false;
          var that = this;
          this.spire.session.createSubscription({
            name: 'sub_name',
            channelNames: ['foo']
          }, function (err, sub) {
            that.sub = sub;
            finished = true;
          });

          waitsFor(function () {
            return finished;
          }, 'subscribing to a channel', 10000);
        });

        it('should return a subscription resource', function () {
          expect(this.sub).toBeAResourceObject();
        });

        describe('Creating subscription with the same name', function () {
          beforeEach(function () {
            var finished = false;
            var that = this;
            this.spire.session.findOrCreateSubscription({
              name: 'sub_name',
              channelNames: ['foo']
            }, function (err, sub) {
              that.sub2 = sub;
              finished = true;
            });

            waitsFor(function () {
              return finished;
            }, 'subscribing to a channel', 10000);
          });

          it('should return the previously created subscription', function () {
            expect(this.sub2.url()).toBe(this.sub.url());
          });
        }); // Create a subscription with the same name

        describe('Getting all subscriptions for a channel', function () {
          beforeEach(function () {
            var finished = false;
            var that = this;
            this.channel.subscriptions(function (err, subs) {
              that.subscriptions = subs;
              finished = true;
            });

            waitsFor(function () {
              return finished;
            }, 'getting channel subscriptions', 10000);
          });

          it("Should return a hash of subscriptions including 'sub_name'", function () {
            expect(this.subscriptions.sub_name).toBeDefined()
          });
        });

        describe('Getting the subscription by name', function () {
          beforeEach(function () {
            var finished = false;
            var that = this;
            this.spire.session.subscriptionByName('sub_name', function (err, sub) {
              that.subscription = sub;
              finished = true;
            });

            waitsFor(function () {
              return finished;
            }, 'getting subscription by name', 10000);
          });

          it("Should return the right sub", function () {
            expect(this.subscription.name()).toBe('sub_name');
          });
        });

        describe('Listen for the message we sent', function () {
          beforeEach(function () {
            var finished = false;
            runs(function () {
              var that = this;
              this.sub.poll(function(err, events) {
                finished = true;
                that.messages = events.messages;
              });
            });

            waitsFor(function () {
              return finished;
            }, 'Listening on a subscription', 10000);
          });

          it('should get an array of messages', function () {
            expect(this.messages instanceof Array).toBeTruthy();
          });

          it('should get back the message we sent', function () {
            expect(this.messages[0].content).toBe('Hello world!');
          });

          it('should not give us any other messages', function () {
            expect(this.messages.length).toBe(1);
          });

        }); // Listen for the message we sent
      }); // Create a subscription to a channel
    }); // Publish to a channel

    describe('Event listening on a channel', function () {
      beforeEach(function () {
        var finished = false;
        runs(function () {
          var that = this;
          this.spire.session.createChannel('event_channel', function (err, channel) {
            that.channel = channel;
            finished = true;
          });
        });

        waitsFor(function () {
          return finished;
        }, 'Creating event_channel', 10000);

        var finished2 = false;
        runs(function () {
          var that = this;
          this.spire.session.createSubscription({
            name: 'new_sub',
            channelNames: ['event_channel']
          }, function (err, sub) {
            that.sub = sub;
            finished2 = true;
          });
        });

        waitsFor(function () {
          return finished2;
        }, 'Creating new_sub on event_channel', 10000);

        runs(function () {
          var that = this;
          this.sub.addListener('message', function (m) {
            that.last_message = m;
          });
          this.sub.startListening({
            timeout: 5
          });
        });
      });

      describe('A listener is called each time a message is received', function () {
        beforeEach(function () {
          var finished = false;
          runs(function () {
            var that = this;
            setTimeout(function () {
              that.channel.publish('Message1', function (err, m) {
                setTimeout(function () {
                  finished = true;
                }, 1000);
              });
            }, 1000);
          });

          waitsFor(function () {
            return finished;
          }, 'Publishing "Message1"', 10000);
        });

        it('should have the last message', function () {
          expect(this.last_message.content).toBe('Message1');
          this.sub.stopListening();
        });


      }); // A listener is called each time a message is received

    }); // Event listening on a channel
  }); // Create a channel
}); // Channels



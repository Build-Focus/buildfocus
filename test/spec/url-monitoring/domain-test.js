/* global describe, it */

(function () {
  'use strict';

  var Domain;

  describe('Domain model', function () {
    before(function (done) {
      require(["url-monitoring/domain"], function (loadedDomainClass) {
        Domain = loadedDomainClass;
        done();
      });
    });

    describe('validity check', function () {
      it('should allow simple domains', function () {
        var domain = new Domain("google.com");
        expect(domain.isValid).to.equal(true);
      });

      it('should allow domains with protocols', function () {
        var domain = new Domain("http://google.com");
        expect(domain.isValid).to.equal(true);
      });

      it('should allow domains with paths', function () {
        var domain = new Domain("google.com/home-page");
        expect(domain.isValid).to.equal(true);
      });

      it('should allow domains with ports', function () {
        var domain = new Domain("google.com:80");
        expect(domain.isValid).to.equal(true);
      });

      it('should allow domains with paths and protocols', function () {
        var domain = new Domain("http://google.com/home-page");
        expect(domain.isValid).to.equal(true);
      });

      it('should allow domains with everything', function () {
        var domain = new Domain("http://a:b@google.com:80/my-path/hi?query=true#fragment");
        expect(domain.isValid).to.equal(true);
      });

      it('should reject empty patterns', function () {
        var domain = new Domain("");
        expect(domain.isValid).to.equal(false);
      });

      it('should reject meaningless patterns', function () {
        expect(new Domain("/").isValid).to.equal(false);
        expect(new Domain("#").isValid).to.equal(false);
        expect(new Domain("???").isValid).to.equal(false);
      });

      it('should reject patterns without valid domains', function () {
        var domain = new Domain("http://");
        expect(domain.isValid).to.equal(false);
      });
    });

    describe('URL matching', function () {
      it('should match identical URL', function () {
        var url = "http://google.com/page?1#2";
        expect(new Domain(url).matches(url)).to.equal(true);
      });

      describe('by domain', function () {
        it('should not match different domains', function () {
          expect(new Domain("google.com").matches("facebook.com")).to.equal(false);
        });

        it('should match subdomains of domain pattern', function () {
          expect(new Domain("github.com").matches("pimterry.github.com")).to.equal(true);
        });

        it('should not match parent domains of with subdomain pattern', function () {
          expect(new Domain("mail.google.com").matches("google.com")).to.equal(false);
        });
      });

      describe('by path', function () {
        it('should match on matched paths', function () {
          expect(new Domain("facebook.com/myprofile").matches("facebook.com/myprofile")).to.equal(true);
        });

        it('should not match if pattern path is not present', function () {
          expect(new Domain("google.com/home-page").matches("google.com")).to.equal(false);
        });

        it('should match extra path if there is no path in the pattern', function () {
          expect(new Domain("google.com").matches("google.com/home-page")).to.equal(true);
        });

        it('should match if input path is child of pattern path', function () {
          expect(new Domain("facebook.com/myprofile").matches("facebook.com/myprofile/2")).to.equal(true);
        });
      });

      describe('by port', function () {
        it("should match if the pattern's port matches the input port", function () {
          expect(new Domain("google.com:80").matches("google.com:80")).to.equal(true);
        });

        it("should always match if the pattern contains no port", function () {
          expect(new Domain("google.com").matches("google.com:80")).to.equal(true);
          expect(new Domain("google.com").matches("google.com:81")).to.equal(true);
          expect(new Domain("google.com").matches("google.com:8080")).to.equal(true);
        });

        it("should not match if the ports don't match", function () {
          expect(new Domain("google.com:80").matches("google.com:81")).to.equal(false);
        });

        it('should match http as port 80 by default', function () {
          expect(new Domain("google.com:80").matches("http://google.com")).to.equal(true);
        });

        it('should not match http as port 80 if it has an explicit port', function () {
          expect(new Domain("google.com:80").matches("http://google.com:8080")).to.equal(false);
        });

        it('should match https as port 443 by default', function () {
          expect(new Domain("google.com:443").matches("https://google.com")).to.equal(true);
        });

        it('should not match https as port 443 if it has an explicit port', function () {
          expect(new Domain("google.com:443").matches("https://google.com:8080")).to.equal(false);
        });
      });

      describe('by protocol', function () {
        it("should match all protocols if no protocol is specified in the pattern", function () {
          expect(new Domain("google.com").matches("ftp://google.com")).to.equal(true);
          expect(new Domain("google.com").matches("http://google.com")).to.equal(true);
          expect(new Domain("google.com").matches("https://google.com")).to.equal(true);
        });

        it("should match all protocols, ignoring any protocol that is specified in the pattern", function () {
          expect(new Domain("https://google.com").matches("ftp://google.com")).to.equal(true);
          expect(new Domain("https://google.com").matches("http://google.com")).to.equal(true);
          expect(new Domain("https://google.com").matches("https://google.com")).to.equal(true);
        });
      });
    });
  });
})();
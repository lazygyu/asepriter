"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Asepriter = void 0;
;
var Asepriter = /** @class */ (function () {
    function Asepriter(json, img) {
        this._loaded = false;
        this._sprites = [];
        this._frames = [];
        this._handlers = {};
        this._json = json;
        this._image = img;
        this._parseJson();
    }
    Object.defineProperty(Asepriter.prototype, "isLoaded", {
        get: function () {
            return this._loaded;
        },
        enumerable: false,
        configurable: true
    });
    Asepriter.prototype._parseJson = function () {
        return __awaiter(this, void 0, void 0, function () {
            var json, frames;
            return __generator(this, function (_a) {
                json = this._json;
                frames = [];
                if (!Array.isArray(json.frames)) {
                    Object.keys(json.frames).map(function (frmKey) {
                        var frm = json.frames[frmKey];
                        frm.name = frmKey;
                        frames.push(frm);
                    });
                }
                else {
                    frames.push.apply(frames, json.frames);
                }
                this._frames = frames;
                this._loadFrames(frames);
                this._parseTags();
                this._loaded = true;
                this._emit("load" /* AsepriterEvent.load */);
                return [2 /*return*/];
            });
        });
    };
    Asepriter.prototype._loadFrames = function (frames) {
        this._sprites = frames.map(this._parseFrame);
    };
    Asepriter.prototype._parseFrame = function (frm) {
        var canv = document.createElement('canvas');
        canv.width = frm.frame.w;
        canv.height = frm.frame.h;
        var ctx = canv.getContext('2d');
        ctx.drawImage(this._image, frm.frame.x, frm.frame.y, frm.frame.w, frm.frame.h, 0, 0, frm.frame.w, frm.frame.h);
        return canv;
    };
    Asepriter.prototype._parseTags = function () {
        throw new Error("Method not implemented.");
    };
    Asepriter.create = function (jsonPath, imageUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, json, img;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            fetch(jsonPath).then(function (res) { return res.json(); }),
                            this._loadImage(imageUrl)
                        ])];
                    case 1:
                        _a = _b.sent(), json = _a[0], img = _a[1];
                        return [2 /*return*/, new Asepriter(json, img)];
                }
            });
        });
    };
    Asepriter._loadImage = function (imageUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (rs) {
                        var img = new Image();
                        img.src = imageUrl;
                        img.addEventListener('load', function () { rs(img); });
                    })];
            });
        });
    };
    Asepriter.prototype.on = function (eventName, handler) {
        if (!(eventName in this._handlers) || !this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(handler);
    };
    Asepriter.prototype._emit = function (eventName) {
        var _a;
        if (!this._handlers[eventName])
            return;
        (_a = this._handlers[eventName]) === null || _a === void 0 ? void 0 : _a.forEach(function (handler) { return handler(); });
    };
    return Asepriter;
}());
exports.Asepriter = Asepriter;

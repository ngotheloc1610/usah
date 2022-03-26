// source: query_model.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = (function() {
  if (this) { return this; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  if (typeof self !== 'undefined') { return self; }
  return Function('return this')();
}.call(null));

goog.exportSymbol('proto.CalculationMode', null, global);
goog.exportSymbol('proto.Symbol', null, global);
goog.exportSymbol('proto.SymbolStatus', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Symbol = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.Symbol, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.Symbol.displayName = 'proto.Symbol';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Symbol.prototype.toObject = function(opt_includeInstance) {
  return proto.Symbol.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Symbol} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Symbol.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbolId: jspb.Message.getFieldWithDefault(msg, 1, 0),
    symbolCode: jspb.Message.getFieldWithDefault(msg, 2, ""),
    symbolName: jspb.Message.getFieldWithDefault(msg, 3, ""),
    calculationMode: jspb.Message.getFieldWithDefault(msg, 4, 0),
    contractSize: jspb.Message.getFieldWithDefault(msg, 5, 0),
    digits: jspb.Message.getFieldWithDefault(msg, 6, 0),
    exchange: jspb.Message.getFieldWithDefault(msg, 7, ""),
    currencyCode: jspb.Message.getFieldWithDefault(msg, 8, ""),
    description: jspb.Message.getFieldWithDefault(msg, 9, ""),
    tickSize: jspb.Message.getFieldWithDefault(msg, 10, ""),
    lotSize: jspb.Message.getFieldWithDefault(msg, 11, ""),
    minLot: jspb.Message.getFieldWithDefault(msg, 12, ""),
    ceiling: jspb.Message.getFieldWithDefault(msg, 13, ""),
    floor: jspb.Message.getFieldWithDefault(msg, 14, ""),
    limitRate: jspb.Message.getFieldWithDefault(msg, 15, ""),
    spread: jspb.Message.getFieldWithDefault(msg, 16, ""),
    prevClosePrice: jspb.Message.getFieldWithDefault(msg, 17, ""),
    retailPrevClosePrice: jspb.Message.getFieldWithDefault(msg, 18, ""),
    symbolStatus: jspb.Message.getFieldWithDefault(msg, 19, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Symbol}
 */
proto.Symbol.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Symbol;
  return proto.Symbol.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Symbol} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Symbol}
 */
proto.Symbol.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSymbolId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbolCode(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbolName(value);
      break;
    case 4:
      var value = /** @type {!proto.CalculationMode} */ (reader.readEnum());
      msg.setCalculationMode(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setContractSize(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setDigits(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setExchange(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setCurrencyCode(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setTickSize(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setLotSize(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setMinLot(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.setCeiling(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readString());
      msg.setFloor(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setLimitRate(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readString());
      msg.setSpread(value);
      break;
    case 17:
      var value = /** @type {string} */ (reader.readString());
      msg.setPrevClosePrice(value);
      break;
    case 18:
      var value = /** @type {string} */ (reader.readString());
      msg.setRetailPrevClosePrice(value);
      break;
    case 19:
      var value = /** @type {!proto.SymbolStatus} */ (reader.readEnum());
      msg.setSymbolStatus(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Symbol.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Symbol.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.Symbol} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Symbol.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbolId();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getSymbolCode();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getSymbolName();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getCalculationMode();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getContractSize();
  if (f !== 0) {
    writer.writeInt64(
      5,
      f
    );
  }
  f = message.getDigits();
  if (f !== 0) {
    writer.writeInt64(
      6,
      f
    );
  }
  f = message.getExchange();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getCurrencyCode();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getTickSize();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getLotSize();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getMinLot();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
  f = message.getCeiling();
  if (f.length > 0) {
    writer.writeString(
      13,
      f
    );
  }
  f = message.getFloor();
  if (f.length > 0) {
    writer.writeString(
      14,
      f
    );
  }
  f = message.getLimitRate();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getSpread();
  if (f.length > 0) {
    writer.writeString(
      16,
      f
    );
  }
  f = message.getPrevClosePrice();
  if (f.length > 0) {
    writer.writeString(
      17,
      f
    );
  }
  f = message.getRetailPrevClosePrice();
  if (f.length > 0) {
    writer.writeString(
      18,
      f
    );
  }
  f = message.getSymbolStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      19,
      f
    );
  }
};


/**
 * optional int32 symbol_id = 1;
 * @return {number}
 */
proto.Symbol.prototype.getSymbolId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setSymbolId = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional string symbol_code = 2;
 * @return {string}
 */
proto.Symbol.prototype.getSymbolCode = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setSymbolCode = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string symbol_name = 3;
 * @return {string}
 */
proto.Symbol.prototype.getSymbolName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setSymbolName = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional CalculationMode calculation_mode = 4;
 * @return {!proto.CalculationMode}
 */
proto.Symbol.prototype.getCalculationMode = function() {
  return /** @type {!proto.CalculationMode} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.CalculationMode} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setCalculationMode = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional int64 contract_size = 5;
 * @return {number}
 */
proto.Symbol.prototype.getContractSize = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setContractSize = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional int64 digits = 6;
 * @return {number}
 */
proto.Symbol.prototype.getDigits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setDigits = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional string exchange = 7;
 * @return {string}
 */
proto.Symbol.prototype.getExchange = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setExchange = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string currency_code = 8;
 * @return {string}
 */
proto.Symbol.prototype.getCurrencyCode = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setCurrencyCode = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional string description = 9;
 * @return {string}
 */
proto.Symbol.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};


/**
 * optional string tick_size = 10;
 * @return {string}
 */
proto.Symbol.prototype.getTickSize = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setTickSize = function(value) {
  return jspb.Message.setProto3StringField(this, 10, value);
};


/**
 * optional string lot_size = 11;
 * @return {string}
 */
proto.Symbol.prototype.getLotSize = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setLotSize = function(value) {
  return jspb.Message.setProto3StringField(this, 11, value);
};


/**
 * optional string min_lot = 12;
 * @return {string}
 */
proto.Symbol.prototype.getMinLot = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setMinLot = function(value) {
  return jspb.Message.setProto3StringField(this, 12, value);
};


/**
 * optional string ceiling = 13;
 * @return {string}
 */
proto.Symbol.prototype.getCeiling = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setCeiling = function(value) {
  return jspb.Message.setProto3StringField(this, 13, value);
};


/**
 * optional string floor = 14;
 * @return {string}
 */
proto.Symbol.prototype.getFloor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setFloor = function(value) {
  return jspb.Message.setProto3StringField(this, 14, value);
};


/**
 * optional string limit_rate = 15;
 * @return {string}
 */
proto.Symbol.prototype.getLimitRate = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setLimitRate = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional string spread = 16;
 * @return {string}
 */
proto.Symbol.prototype.getSpread = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setSpread = function(value) {
  return jspb.Message.setProto3StringField(this, 16, value);
};


/**
 * optional string prev_close_price = 17;
 * @return {string}
 */
proto.Symbol.prototype.getPrevClosePrice = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 17, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setPrevClosePrice = function(value) {
  return jspb.Message.setProto3StringField(this, 17, value);
};


/**
 * optional string retail_prev_close_price = 18;
 * @return {string}
 */
proto.Symbol.prototype.getRetailPrevClosePrice = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 18, ""));
};


/**
 * @param {string} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setRetailPrevClosePrice = function(value) {
  return jspb.Message.setProto3StringField(this, 18, value);
};


/**
 * optional SymbolStatus symbol_status = 19;
 * @return {!proto.SymbolStatus}
 */
proto.Symbol.prototype.getSymbolStatus = function() {
  return /** @type {!proto.SymbolStatus} */ (jspb.Message.getFieldWithDefault(this, 19, 0));
};


/**
 * @param {!proto.SymbolStatus} value
 * @return {!proto.Symbol} returns this
 */
proto.Symbol.prototype.setSymbolStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 19, value);
};


/**
 * @enum {number}
 */
proto.CalculationMode = {
  CAL_NONE: 0,
  CAL_CFD: 4,
  CAL_SPAN: 90,
  CAL_FOREX: 100
};

/**
 * @enum {number}
 */
proto.SymbolStatus = {
  SYMBOL_NONE: 0,
  SYMBOL_ACTIVE: 1,
  SYMBOL_DEACTIVE: 2
};

goog.object.extend(exports, proto);

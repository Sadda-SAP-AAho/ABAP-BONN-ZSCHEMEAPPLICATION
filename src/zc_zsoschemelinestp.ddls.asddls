@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'Projection View forzsoschemelines'
@ObjectModel.semanticKey: [ 'Productcode' ]
@Search.searchable: true
define view entity ZC_zsoschemelinesTP
  as projection on ZR_zsoschemelinesTP as zsoschemelines
{
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.90 
  key Bukrs,
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.90 
  key Salesorder,
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.90 
  key Schemecode,
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.90 
  key Schemegroupcode,
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.90 
  key Productcode,
  Schemecheckcode,
  Productdesc,
  Freeqty,
  CreatedBy,
  CreatedAt,
  LastChangedBy,
  LastChangedAt,
  LocalLastChangedAt,
  _zsoscheme : redirected to parent ZC_zsoscheme01TP
  
}

@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'Projection View forzsoscheme'
@ObjectModel.semanticKey: [ 'Salesorder' ]
@Search.searchable: true
define root view entity ZC_zsoscheme01TP
  provider contract transactional_query
  as projection on ZR_zsoscheme01TP as zsoscheme
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
  Schemecheckcode,
  Orderqty,
  Freeqty,
  Appliedqty,
  CreatedBy,
  CreatedAt,
  LastChangedBy,
  LastChangedAt,
  LocalLastChangedAt,
  _zsoschemelines : redirected to composition child ZC_zsoschemelinesTP
  
}
